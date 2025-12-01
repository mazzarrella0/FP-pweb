import { Request, Response } from "express";
import * as bookService from "../services/book.service";

import {
    ApiBookQuery,
    BookCondition,
    CreateBookInput,
    UpdateBookInput,
} from "@react-express-library/shared";

import {
    validateBookData,
    validateBookUpdateData,
    validatePagination,
} from "../utils/validation";

/**
 * Handler untuk membuat buku baru (POST /books)
 */
export const handleCreateBook = async (req: Request, res: Response) => {
    try {

        const bookData = req.body as CreateBookInput;

        const validationErrors = validateBookData(bookData);
        if (validationErrors) {
            return res.status(400).json({
                success: false,
                message: "Invalid book data.",
                errors: validationErrors,
            });
        }
        
        const {
            title,
            writer,
            publisher,
            publicationYear,
            price,
            stockQuantity,
            genreId,
            condition,
        } = bookData;

        if (
            !title ||
            !writer ||
            !publisher ||
            publicationYear === undefined ||
            price === undefined ||
            stockQuantity === undefined ||
            !genreId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing required fields: title, writer, publisher, publicationYear, price, stockQuantity, genreId are all required.",
            });
        }

        if (condition && !Object.values(BookCondition).includes(condition)) {
            return res.status(400).json({
                success: false,
                message: `Invalid book condition. Accepted values are: ${Object.values(
                    BookCondition
                ).join(", ")}.`,
            });
        }

        const newBook = await bookService.createBook(bookData);
        res.status(201).json({
            success: true,
            message: "Book added successfully",
            data: newBook,
        });
    } catch (error: unknown) {
        console.error("[ERROR] Failed to create book:", error);
        // Type-safe error handling
        if (error instanceof Error) {
            // 409 Conflict
            if (error.message.includes("already exists")) {
                return res.status(409).json({
                    success: false,
                    message: error.message,
                });
            }
            // 404 Not Found (for genreId)
            if (
                error.message.includes("Genre with ID") &&
                error.message.includes("not found")
            ) {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            // 400 Bad Request
            if (
                error.message.includes("Invalid genre ID format") ||
                error.message.includes("Missing required fields")
            ) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error.message.includes("non-negative values")) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            if (
                error.message.includes(
                    "Publication year cannot be in the future"
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error.message.includes("Invalid data type")) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            // Fallback for other service/database errors
            return res.status(500).json({
                success: false,
                message: error.message, // Use the specific error message
            });
        }
        // Generic error
        res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * Handler untuk mengupdate buku (PATCH /books/:book_id)
 */
export const handleUpdateBook = async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;
        // Validasi bahwa hanya field tertentu yang boleh diupdate
        const allowedUpdates = [
            "description",
            "price",
            "stockQuantity",
            "stock_quantity",
        ];
        const receivedKeys = Object.keys(req.body);
        const invalidKeys = receivedKeys.filter(
            (key) => !allowedUpdates.includes(key)
        );

        if (invalidKeys.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid field(s) for update: ${invalidKeys.join(
                    ", "
                )}. Only description, price, and stockQuantity can be updated.`,
            });
        }
        // Map snake_case to camelCase for the service
        const updateData: UpdateBookInput = {
            description: req.body.description,
            price: req.body.price,
            stockQuantity: req.body.stockQuantity ?? req.body.stock_quantity, // Use nullish coalescing
        };
        // Remove undefined fields so the service doesn't try to update them to null
        Object.keys(updateData).forEach((key) => {
            // Assert that 'key' is one of the keys OF 'updateData'
            const typedKey = key as keyof typeof updateData;
            if (updateData[typedKey] === undefined) {
                delete updateData[typedKey];
            }
        });

        const validationErrors = validateBookUpdateData(updateData);
        if (validationErrors) {
            return res.status(400).json({
                success: false,
                message: "Invalid book data.",
                errors: validationErrors,
            });
        }

        if (!book_id) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required in the URL parameter.",
            });
        }

        const updatedBook = await bookService.updateBook(book_id, updateData);
        res.status(200).json({
            success: true,
            message: "Book updated successfully",
            data: updatedBook,
        });
    } catch (error: unknown) {
        console.error("[ERROR] Failed to update book:", error);
        if (error instanceof Error) {
            // 404 Not Found
            if (error.message.includes("Book not found")) {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            // 400 Bad Request
            if (
                error.message.includes("Invalid book ID format") ||
                error.message.includes("No valid fields")
            ) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            // Fallback for other service/database errors
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
        // Generic error
        res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

// Fungsi handleGetBookById dan handleGetBooksByGenre sudah cukup aman
// dan bisa dibiarkan seperti versi sebelumnya. Di bawah ini adalah salinannya.

/**
 * Handler untuk mendapatkan detail buku (GET /books/:book_id)
 */
export const handleGetBookById = async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;
        if (!book_id) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required in the URL parameter.",
            });
        }
        const book = await bookService.getBookById(book_id);

        res.status(200).json({
            success: true,
            message: "Get book detail successfully",
            data: book,
        });
    } catch (error: unknown) {
        console.error("[ERROR] Failed to get book by ID:", error);
        if (error instanceof Error) {
            // 404 Not Found
            if (error.message.includes("Book not found")) {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            // 400 Bad Request
            if (error.message.includes("Invalid book ID format")) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            // Fallback for other service/database errors
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
        // Generic error
        res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * Handler untuk mendapatkan buku berdasarkan genre (GET /books/genre/:genre_id)
 */
export const handleGetBooksByGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        // Menyerahkan keseluruhan query pada service untuk penanganan pagination, filter, dan sorting
        const query = req.query as ApiBookQuery;

        const paginationError = validatePagination(query.page, query.limit);
        if (paginationError) {
            return res
                .status(400)
                .json({ success: false, message: paginationError });
        }

        if (!genre_id) {
            return res.status(400).json({
                success: false,
                message: "Genre ID is required in the URL parameter.",
            });
        }

        const result = await bookService.getBooksByGenreId(genre_id, query);

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        res.status(200).json({
            success: true,
            message: "Get all books by genre successfully",
            data: result.books,
            meta: {
                page,
                limit,
                total: result.total,
                next_page: result.total > page * limit ? page + 1 : null,
                prev_page: page > 1 ? page - 1 : null,
            },
        });
    } catch (error: unknown) {
        console.error("[ERROR] Failed to get books by genre:", error);
        if (error instanceof Error) {
            // Map specific errors from service
            // 404 Not Found (for genreId)
            if (
                error.message.includes("Genre with ID") &&
                error.message.includes("not found")
            ) {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            // 400 Bad Request
            if (error.message.includes("Invalid genre ID format")) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            // Fallback for other service/database errors
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
        // Generic error
        res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * Handler untuk menghapus buku (DELETE /books/:book_id).
 */
export const handleDeleteBook = async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;

        if (!book_id) {
            return res.status(400).json({
                success: false,
                message: "Book ID is required in the URL parameter.",
            });
        }

        await bookService.deleteBookById(book_id);
        res.status(200).json({
            success: true,
            message: "Book removed successfully",
        });
    } catch (error: unknown) {
        console.error("DELETE BOOK ERROR:", error);
        if (error instanceof Error) {
            // 404 Not Found
            if (error.message.includes("Book not found")) {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            // 400 Bad Request
            if (error.message.includes("Invalid book ID format")) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            // Fallback for other service/database errors
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
        // Generic error
        res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * Handler untuk mendapatkan semua buku (GET /books).
 */
export const handleGetAllBooks = async (req: Request, res: Response) => {
    try {
        const query = req.query as ApiBookQuery;

        const paginationError = validatePagination(query.page, query.limit);
        if (paginationError) {
            return res
                .status(400)
                .json({ success: false, message: paginationError });
        }

        const result = await bookService.getAllBooks(query);

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        res.status(200).json({
            success: true,
            // Postman shows "Get all book successfully"
            message: "Get all book successfully",
            data: result.books,
            meta: {
                page,
                limit,
                total: result.total,
                next_page: result.total > page * limit ? page + 1 : null,
                prev_page: page > 1 ? page - 1 : null,
            },
        });
    } catch (error: unknown) {
        console.error("GET ALL BOOKS ERROR:", error);
        let errorMessage = "Internal server error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({
            success: false,
            message: errorMessage,
        });
    }
};
