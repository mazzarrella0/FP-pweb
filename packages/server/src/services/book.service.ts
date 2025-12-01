import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

import {
    ApiBook,
    ApiBookCreateResponse,
    ApiBookListResponse,
    ApiBookQuery,
    ApiBookUpdateResponse,
    BookCondition,
    CreateBookInput,
    UpdateBookInput,
} from "@react-express-library/shared";

/**
 * Membuat buku baru.
 * @param bookData Data untuk buku baru.
 */
export const createBook = async (bookData: CreateBookInput): Promise<ApiBookCreateResponse> => {
    if (
        !bookData.title ||
        !bookData.genreId ||
        bookData.price == null ||
        bookData.stockQuantity == null
    ) {
        throw new Error(
            "Missing required fields: title, genreId, price, and stockQuantity are required."
        );
    }

    if (bookData.price < 0 || bookData.stockQuantity < 0) {
        throw new Error("Price and stockQuantity must be non-negative values.");
    }

    if (bookData.publicationYear > new Date().getFullYear()) {
        throw new Error("Publication year cannot be in the future.");
    }

    if (!isNaN(bookData.stockQuantity) && bookData.stockQuantity % 1 !== 0) {
        throw new Error("Stock quantity must be an integer.");
    }

    // Ambil genreId secara terpisah, dan sisanya masukkan ke variabel 'rest'
    const { genreId, ...rest } = bookData;

    try {
        const newBook = await prisma.book.create({
            data: {
                ...rest,
                publicationYear: Number(rest.publicationYear), // Ensure numeric types
                price: Number(rest.price),
                stockQuantity: Number(rest.stockQuantity),
                condition: bookData.condition,
                genre: {
                    connect: {
                        id: genreId,
                    },
                },
            },
            select: {
                // Select fields based on Postman response
                id: true,
                title: true,
                createdAt: true, // Postman shows created_at
            },
        });
        return newBook;
    } catch (error: unknown) {
        console.error("Error creating book:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2002: Unique constraint failed (e.g., book title already exists)
            if (error.code === "P2002") {
                throw new Error(
                    `A book with the title "${bookData.title}" already exists.`
                );
            }
            // P2025: Foreign key constraint failed (e.g., Genre ID not found)
            if (error.code === "P2025") {
                throw new Error(`Genre with ID "${genreId}" not found.`);
            }
            // P2023: Invalid ID format for genreId
            if (error.code === "P2023") {
                throw new Error("Invalid genre ID format.");
            }
        }
        // Generic fallback
        throw new Error("Database error while creating book.");
    }
};

/**
 * Mengambil detail satu buku berdasarkan ID.
 * @param bookId ID dari buku yang akan dicari.
 */
export const getBookById = async (bookId: string): Promise<ApiBook> => {
    try {
        const book = await prisma.book.findUnique({
            where: {
                id: bookId,
                deletedAt: null, // Only find non-deleted books
            },
            select: {
                id: true,
                title: true,
                writer: true,
                publisher: true,
                description: true,
                coverImage: true,
                publicationYear: true,
                price: true,
                stockQuantity: true,
                condition: true,
                genre: {
                    // Include genre name
                    select: { name: true },
                },
            },
        });

        if (!book) {
            throw new Error("Book not found");
        }

        const { genre, ...bookData } = book;
        return { ...bookData, genre: genre?.name ?? '' };
    } catch (error: unknown) {
        console.error(`Error retrieving book by ID ${bookId}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2023: Invalid ID format
            if (error.code === "P2023") {
                throw new Error("Invalid book ID format");
            }
        }

        // Generic fallback
        throw new Error("Database error while retrieving book by ID.");
    }
};

/**
 * Mengupdate data buku (deskripsi, harga, stok).
 * @param bookId ID dari buku yang akan diupdate.
 * @param bookData Data baru untuk buku.
 */
export const updateBook = async (bookId: string, bookData: UpdateBookInput): Promise<ApiBookUpdateResponse> => {
    // Validasi: Pastikan setidaknya satu kolom di-update
    if (
        Object.keys(bookData).length === 0 ||
        (bookData.description === undefined &&
            bookData.price === undefined &&
            bookData.stockQuantity === undefined)
    ) {
        throw new Error(
            "No valid fields provided for update. Only 'description', 'price', or 'stockQuantity' can be updated."
        );
    }

    try {
        // Check if book exists before updating
        const existingBook = await prisma.book.findUnique({
            where: { id: bookId, deletedAt: null },
        });

        if (!existingBook) {
            throw new Error("Book not found");
        }

        const updatedBook = await prisma.book.update({
            where: { id: bookId },
            data: bookData,
            select: {
                id: true,
                title: true,
                updatedAt: true,
                price: true,
                stockQuantity: true,
            },
        });
        return updatedBook;
    } catch (error: unknown) {
        console.error(`Error updating book ID ${bookId}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2025: Record to update not found
            if (error.code === "P2025") {
                throw new Error("Book not found");
            }
            // P2023: Invalid ID format
            if (error.code === "P2023") {
                throw new Error("Invalid book ID format");
            }
            if (error.code === "P2003") {
                throw new Error(
                    "Foreign key constraint failed while updating book."
                );
            }
            if (error.code === "P2004") {
                throw new Error("Invalid data provided for updating book.");
            }
        }

        // Generic fallback
        throw new Error("Database error while updating book.");
    }
};

/**
 * Mengambil daftar buku berdasarkan genre dengan pagination.
 * @param genreId ID dari genre yang dicari.
 * @param page Halaman saat ini.
 * @param limit Jumlah data per halaman.
 */
export const getBooksByGenreId = async (genreId: string, query: ApiBookQuery): Promise<ApiBookListResponse> => {
    try {
        const genreExists = await prisma.genre.findUnique({
            where: { id: genreId, deletedAt: null },
        });
        if (!genreExists) {
            throw new Error(`Genre with ID "${genreId}" not found.`); // Check if it exists
        }
        const {
            page = 1,
            limit = 10,
            search,
            orderByTitle,
            orderByPublishDate,
            condition,
        } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const whereCondition: Prisma.BookWhereInput = {
            genreId: genreId,
            deletedAt: null, // Only find non-deleted books
        };
        if (search) {
            whereCondition.title = { contains: search, mode: "insensitive" };
        }

        if (condition && Object.values(BookCondition).includes(condition)) {
            whereCondition.condition = condition as BookCondition;
        }

        const orderBy: Prisma.BookOrderByWithRelationInput[] = [];
        if (orderByTitle)
            orderBy.push({ title: orderByTitle as "asc" | "desc" });
        if (orderByPublishDate)
            orderBy.push({
                publicationYear: orderByPublishDate as "asc" | "desc",
            });
        // Default sort
        if (orderBy.length === 0) orderBy.push({ createdAt: "desc" });

        const books = await prisma.book.findMany({
            where: whereCondition,
            skip: skip,
            take: Number(limit),
            orderBy: orderBy,
            select: {
                // Select fields based on Postman response
                id: true,
                title: true,
                writer: true,
                publisher: true,
                publicationYear: true,
                description: true,
                coverImage: true,
                price: true,
                stockQuantity: true,
                condition: true,
                genre: { select: { name: true } }, // Keep genre name
            },
        });
        const totalBooks = await prisma.book.count({ where: whereCondition });

        // Map genre name like in getBookById
        const formattedBooks = books.map((book) => {
            const { genre, ...bookData } = book;
            return { ...bookData, genre: genre?.name };
        });

        return { books: formattedBooks, total: totalBooks };
    } catch (error: unknown) {
        console.error(`Error retrieving books for genre ID ${genreId}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2023: Invalid ID format for genreId
            if (error.code === "P2023") {
                throw new Error("Invalid genre ID format");
            }
        }
        // Generic fallback
        throw new Error("Database error while retrieving books by genre.");
    }
};

/**
 * Menghapus buku (soft delete) dengan mengisi kolom 'deletedAt'.
 * @param bookId ID dari buku yang akan dihapus.
 */
export const deleteBookById = async (bookId: string): Promise<void> => {
    try {
        const result = await prisma.book.updateMany({
            where: {
                id: bookId,
                deletedAt: null, // Only delete if not already deleted
            },
            data: {
                deletedAt: new Date(),
            },
        });

        if (result.count === 0) {
            throw new Error("Book not found or already removed");
        }
        // No data returned on success
    } catch (error: unknown) {
        console.error(`Error deleting book ID ${bookId}:`, error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2023: Invalid ID format
            if (error.code === "P2023") {
                throw new Error("Invalid book ID format");
            }
            // P2025: Just a fallback if the updateMany fails to find the record
            if (error.code === "P2025") {
                throw new Error("Book not found");
            }
        }
        // Re-throw our specific error
        if (
            error instanceof Error &&
            error.message.includes("Book not found")
        ) {
            throw error;
        }
        // Generic fallback
        throw new Error("Database error while deleting book.");
    }
};

/**
 * Mengambil semua buku dengan filter dan pagination.
 * @param query Parameter query dari request (page, limit, search, orderByTitle).
 */
export const getAllBooks = async (query: ApiBookQuery): Promise<ApiBookListResponse> => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            orderByTitle,
            orderByPublishDate,
            condition,
        } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const whereCondition: Prisma.BookWhereInput = {
            deletedAt: null, // Only find non-deleted books
        };
        if (search) {
            whereCondition.title = { contains: search, mode: "insensitive" };
        }

        if (condition && Object.values(BookCondition).includes(condition)) {
            whereCondition.condition = condition as BookCondition;
        }

        const orderBy: Prisma.BookOrderByWithRelationInput[] = [];
        if (orderByTitle)
            orderBy.push({ title: orderByTitle as "asc" | "desc" });
        if (orderByPublishDate)
            orderBy.push({
                publicationYear: orderByPublishDate as "asc" | "desc",
            });
        // Default sort
        if (orderBy.length === 0) orderBy.push({ createdAt: "desc" });

        const books = await prisma.book.findMany({
            where: whereCondition,
            skip: skip,
            take: Number(limit),
            orderBy: orderBy,
            select: {
                id: true,
                title: true,
                writer: true,
                publisher: true,
                publicationYear: true,
                description: true,
                coverImage: true,
                price: true,
                stockQuantity: true,
                condition: true,
                genre: { select: { name: true } },
            },
        });

        const totalBooks = await prisma.book.count({ where: whereCondition });

        // Map genre name like in getBookById
        const formattedBooks = books.map((book) => {
            const { genre, ...bookData } = book;
            return { ...bookData, genre: genre?.name ?? ''};
        });

        return { books: formattedBooks, total: totalBooks };
    } catch (error: unknown) {
        console.error("Error retrieving all books:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error(`Prisma Error Code: ${error.code}`);
            throw new Error(
                "A database query error occurred while fetching books."
            );
        }
        // Generic fallback
        throw new Error("Database error while retrieving all books.");
    }
};
