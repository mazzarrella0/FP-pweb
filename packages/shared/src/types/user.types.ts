// packages/shared/src/types/user.types.ts
import { User } from "@prisma/client";

// ----------------------------------------------------------------
// --- Frontend -> Server (Data Sent TO the Backend) ---
// ----------------------------------------------------------------

/**
 * Data required for the "Login" form.
 * This is what the frontend sends to POST /auth/login
 */
export type LoginInput = Pick<User, "email" | "password">;

/**
 * Data required for the "Register" form.
 * This is what the frontend sends to POST /auth/register
 */
export type RegisterInput = Pick<User, "email" | "password"> &
    Partial<Pick<User, "username">>;

// ----------------------------------------------------------------
// --- Server -> Frontend (Data Sent FROM the Backend) ---
// ----------------------------------------------------------------

/**
 * Represents the publicly-safe user data.
 * This is sent from GET /auth/me and is safe to store
 * in your frontend's global state.
 */
export interface PublicUser {
    id: string;
    email: string;
    username: string | null;
}

/**
 * The data sent in the response body from POST /auth/login
 */
export interface LoginResponse {
    access_token: string;
}

/**
 * The data sent in the response body from POST /auth/register
 * This includes the new user's details (minus password).
 */
export interface RegisterResponse extends PublicUser {
    createdAt: Date;
}
