// packages/shared/src/types/genre.types.ts

import { Genre } from "@prisma/client";

// ----------------------------------------------------------------
// --- Frontend -> Server (Data Sent TO the Backend) ---
// ----------------------------------------------------------------

/**
 * Data required for the "Create Genre" form (POST /genre).
 */
export type CreateGenreInput = Pick<Genre, "name">;

/**
 * Data required for the "Update Genre" form (PATCH /genre/:id).
 */
export type UpdateGenreInput = Pick<Genre, "name">;

/**
 * Query parameters for the "Get All Genres" endpoint (GET /genre).
 * Defines all filters, sorting, and pagination.
 */
export interface ApiGenreQuery {
    page?: string;
    limit?: string;
    search?: string;
    orderByName?: "asc" | "desc";
}

// ----------------------------------------------------------------
// --- Server -> Frontend (Data Sent FROM the Backend) ---
// ----------------------------------------------------------------

/**
 * Represents the *minimal* genre data returned in a list (GET /genre).
 * Your service selects only id and name.
 * Perfect for the "Add Book" form's dropdown.
 */
export interface ApiGenre {
    id: string;
    name: string;
}

/**
 * Represents the *full* genre data returned for a single item.
 * This is sent from POST /genre, GET /genre/:id, and PATCH /genre/:id.
 * We Omit 'deletedAt' as it's a private field.
 */
export type ApiGenreDetail = Omit<Genre, "deletedAt">;

/**
 * The full response object for the paginated genre list (GET /genre).
 * Your service returns this, and the controller builds the 'meta' object.
 */
export interface ApiGenreListResponse {
    genres: ApiGenre[];
    total: number;
}
