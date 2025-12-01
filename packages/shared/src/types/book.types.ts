// packages/shared/src/types/book.types.ts

import { Book, BookCondition, Prisma } from "@prisma/client";

// ----------------------------------------------------------------
// --- Frontend -> Server (Data Sent TO the Backend) ---
// ----------------------------------------------------------------

/**
 * Data for the "Add New Book" form (POST /books).
 */
export type CreateBookInput = Omit<
    Book,
    "id" | "createdAt" | "updatedAt" | "deletedAt"
>;

/**
 * Data for the "Edit Book" form (PATCH /books/:id).
 */
export type UpdateBookInput = Partial<
    Pick<Book, "description" | "price" | "stockQuantity" | 'coverImage'>
>;

/**
 * Query parameters for "Get All" book endpoints (GET /books, GET /books/genre/:id).
 * This defines all the filters, sorting, and pagination.
 */
export interface ApiBookQuery {
    page?: string;
    limit?: string;
    search?: string;
    orderByTitle?: "asc" | "desc";
    orderByPublishDate?: "asc" | "desc";
    condition?: BookCondition;
}

// ----------------------------------------------------------------
// --- Server -> Frontend (Data Sent FROM the Backend) ---
// ----------------------------------------------------------------

/**
 * The full book object returned by GET /books/:id.
 * This is the "main" book type your frontend will use.
 */
export interface ApiBook {
    id: string;
    title: string;
    writer: string;
    publisher: string;
    publicationYear: number;
    description: string | null;
    coverImage: string | null;
    price: number;
    stockQuantity: number;
    condition: BookCondition;
    genre: string;
}

/**
 * The minimal data returned after *creating* a book (POST /books).
 * Your service selects only these fields.
 */
export interface ApiBookCreateResponse {
    id: string;
    title: string;
    createdAt: Date;
}

/**
 * The data returned after *updating* a book (PATCH /books/:id).
 * Your service selects only these fields.
 */
export interface ApiBookUpdateResponse {
    id: string;
    title: string;
    updatedAt: Date;
    price: number;
    stockQuantity: number;
}

/**
 * The full response object for paginated book lists.
 * This is what GET /books and GET /books/genre/:id return.
 */
export interface ApiBookListResponse {
    books: ApiBook[];
    total: number;
}

// ----------------------------------------------------------------
// --- Shared Enums (Used by BOTH Frontend and Backend) ---
// ----------------------------------------------------------------

/**
 * Re-exporting the BookCondition enum from Prisma.
 * - Backend uses this for validation & queries.
 * - Frontend uses this for filter dropdowns.
 */
export { BookCondition };
