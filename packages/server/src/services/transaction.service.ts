import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

import {
    ApiTransaction,
    ApiTransactionDetail,
    ApiTransactionListResponse,
    ApiTransactionQuery,
    ApiTransactionStatistics,
    BookOrderItem,
    CreateTransactionResponse,
} from "@react-express-library/shared";

/**
 * * Retrieve a list of all transactions.
 * @author zelebwr
 * @return An array of transaction objects.
 * @description List of all transactions, including user information and details about the boks in each transaction.
 */
export const getAllTransactions = async (query: ApiTransactionQuery): Promise<ApiTransactionListResponse> => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            orderById,
            orderByAmount,
            orderByPrice,
        } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const whereCondition: Prisma.TransactionWhereInput = {};
        if (search) {
            whereCondition.id = {
                contains: search,
                mode: "insensitive",
            };
        }

        const orderBy: Prisma.TransactionOrderByWithRelationInput[] = [];
        if (orderById) {
            orderBy.push({ id: orderById as "asc" | "desc" });
        }
        if (orderByAmount) {
            orderBy.push({ totalAmount: orderByAmount as "asc" | "desc" });
        }
        if (orderByPrice) {
            orderBy.push({ totalPrice: orderByPrice as "asc" | "desc" });
        }
        if (orderBy.length === 0) {
            orderBy.push({ createdAt: "desc" });
        }

        const transactions = await prisma.transaction.findMany({
            where: whereCondition,
            skip: skip,
            take: Number(limit),
            orderBy: orderBy,
            include: {
                // User details, excluding password
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
                // Books details in the transaction
                books: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });

        const totalTransactions = await prisma.transaction.count({
            where: whereCondition,
        });

        return {
            transactions: transactions as any,
            total: totalTransactions,
        };
    } catch (error) {
        console.error("Error retrieving all transactions:", error);
        throw new Error("Database error while retrieving transactions.");
    }
};

/**
 * * Retrieve a single transaction by its unique ID.
 * @author zelebwr
 * @param id The UUID of the transaction to retrieve.
 * @return The transaction object or null if not found.
 * @description Includes user details and detailed book information for the specific transaction.
 */
export const getTransactionById = async (id: string): Promise<ApiTransactionDetail> => {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
                books: {
                    select: {
                        quantity: true,
                        book: {
                            select: {
                                id: true,
                                title: true,
                                writer: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });

        if (!transaction) {
            throw new Error("Transaction not found");
        }

        return transaction as any;
    } catch (error: unknown) {
        console.error("Error retrieving transaction by ID:", error);

        if (error instanceof Error) {
            if (error.message === "Transaction not found") {
                throw error; // Rethrow to be handled by caller
            }
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new Error("Transaction not found"); // ID Valid, but doesn't exit.
            }
            if (error.code === "P2023") {
                throw new Error("Invalid transaction ID format"); // ID not valid.
            }
        }
        throw new Error("Database error while retrieving transaction by ID.");
    }
};

/**
 * * Creates a new transaction (purchase).
 * @author zelebwr
 * @param userId The ID of the user making the transaction.
 * @param books An array of book order items, each containing a bookId and quantity.
 * @return The newly created transaction object.
 * @throws Error if user not found, book not found, or insufficient stock.
 */
export const createTransaction = async (
    userId: string,
    books: BookOrderItem[]
): Promise<CreateTransactionResponse> => {
    if (!userId || !books || books.length === 0) {
        throw new Error("Invalid input: userId and books are required.");
    }
    for (const item of books) {
        if (!item.bookId || !item.quantity || item.quantity <= 0) {
            throw new Error(
                "Invalid book item: invalid bookId and a positive quantity are required."
            );
        }
    }

    try {
        // Prisma's interactive transaction
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new Error("Invalid User ID: User not found");
            }

            const bookIds = books.map((item) => item.bookId);
            const booksInDb = await tx.book.findMany({
                where: {
                    id: { in: bookIds },
                    deletedAt: null,
                },
            });

            if (booksInDb.length !== bookIds.length) {
                const foundIds = booksInDb.map((book) => book.id);
                const missingIds = bookIds.filter(
                    (id) => !foundIds.includes(id)
                );
                throw new Error(`Book(s) not found: ${missingIds.join(", ")}`);
            }

            let totalPrice = 0;
            let totalQuantity = 0;
            const update: Promise<any>[] = [];

            for (const item of books) {
                const book = booksInDb.find((book) => book.id === item.bookId)!;
                if (!book) {
                    throw new Error(`Book not found: ${item.bookId}`);
                }

                if (book.stockQuantity < item.quantity) {
                    throw new Error(
                        `Insufficient stock for book: ${book.title}. Available: ${book.stockQuantity}, Requested: ${item.quantity}`
                    );
                }

                totalPrice += book.price * item.quantity;
                totalQuantity += item.quantity;

                // Update stock quantity
                update.push(
                    tx.book.update({
                        where: { id: book.id },
                        data: { stockQuantity: { decrement: item.quantity } },
                    })
                );
            }

            const newTransaction = await tx.transaction.create({
                data: {
                    userId: userId,
                    totalPrice: totalPrice,
                    totalAmount: totalQuantity,
                    books: {
                        create: books.map((item) => ({
                            bookId: item.bookId,
                            quantity: item.quantity,
                        })),
                    },
                },
            });
            await Promise.all(update);

            return {
                transaction_id: newTransaction.id,
                total_quantity: newTransaction.totalAmount,
                total_price: newTransaction.totalPrice,
            };
        });
    } catch (error: unknown) {
        console.error("Error creating transaction:", error);

        if (error instanceof Error) {
            if (
                error.message.includes("User not found") ||
                error.message.includes("Book(s) not found") ||
                error.message.includes("Insufficient stock") ||
                error.message.includes("Invalid input")
            ) {
                throw error;
            }
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2023") {
                throw new Error("Invalid ID format for User or Book.");
            }
            if (error.code === "P2025") {
                throw new Error(
                    "Foreign key constraint failed: User or Book not found."
                );
            }
        }

        throw new Error("Database error during transaction creation.");
    }
};

/**
 * * Calculates sales statistics.
 * @author zelebwr
 * @return An object containing total sales amount and total number of transactions.
 */
export const getTransactionStatistics = async (): Promise<ApiTransactionStatistics> => {
    try {
        const totalTransactions = await prisma.transaction.count();
        const averageResult = await prisma.transaction.aggregate({
            _avg: {
                totalPrice: true,
            },
        });
        const averageTransactionValue = averageResult._avg.totalPrice ?? 0;

        const genreCount = await prisma.book.findMany({
            where: {
                deletedAt: null,
                transactions: {
                    some: {},
                },
            },
            select: {
                genre: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
        });

        let genreSales: {
            [genreName: string]: { id: string; name: string; count: number };
        } = {};

        genreCount.forEach((book) => {
            const genreName = book.genre.name;
            const count = book._count.transactions;

            if (genreSales[genreName]) {
                genreSales[genreName].count += count;
            } else {
                genreSales[genreName] = {
                    id: book.genre.id,
                    name: genreName,
                    count: count,
                };
            }
        });

        const salesArray = Object.values(genreSales);
        let mostSoldGenre: string | null = null;
        let leastSoldGenre: string | null = null;

        if (salesArray.length > 0) {
            salesArray.sort((a, b) => b.count - a.count); // Sort descending by count

            const firstGenre = salesArray[0];
            const lastGenre = salesArray[salesArray.length - 1];

            if (firstGenre) {
                mostSoldGenre = firstGenre.name;
            }

            if (lastGenre) {
                leastSoldGenre = lastGenre.name;
            }
        }

        return {
            total_transactions: totalTransactions,
            average_transaction_amount: averageTransactionValue,
            fewest_book_sales_genre: leastSoldGenre,
            most_book_sales_genre: mostSoldGenre,
        };
    } catch (error: unknown) {
        console.error("Error calculating transaction statistics:", error);
        throw new Error(
            "Database error while calculating transaction statistics."
        );
    }
};
