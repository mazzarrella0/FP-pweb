import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

import {
    ApiGenre,
    ApiGenreDetail,
    ApiGenreListResponse,
    ApiGenreQuery,
    CreateGenreInput,
    UpdateGenreInput,
} from "@react-express-library/shared";

/**
 * * Retrieve a single genre by its unique ID.
 * @author zelebwr
 * @param id The UUID of the genre to retrieve.
 * @return The genre object or null if not found.
 */
export const getGenreById = async (id: string): Promise<ApiGenreDetail> => {
    try {
        // Use Prisma to find unique genre by ID
        const genre = await prisma.genre.findUnique({
            where: {
                id: id,
                deletedAt: null, // Ensure we only get non-deleted genres
            },
            omit: {
                deletedAt: true,
            }
        });

        if (!genre) {
            throw new Error("Genre not found");
        }

        // Return the genre, or null if Prisma didn't find one
        return genre;
    } catch (error: unknown) {
        console.error("Error retrieving genre by ID:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2023") {
                throw new Error("Invalid genre ID format.");
            }
        }

        if (error instanceof Error && error.message === "Genre not found") {
            throw error;
        }

        throw new Error("Database error while retrieving genre by ID.");
    }
};

/**
 * * Update a genre's data by ID.
 * @author zelebwr
 * @param id The UUID of the genre to update.
 * @param name The new name for the genre.
 * @returns The updated genre object.
 */
export const updateGenreById = async (id: string, data: UpdateGenreInput): Promise<ApiGenreDetail> => {
    try {
        const updatedGenre = await prisma.genre.update({
            where: {
                id: id,
                deletedAt: null, // Only update if not deleted
            },
            data: data, 
            omit: {
                deletedAt: true,
            }
        });
        return updatedGenre;
    } catch (error: unknown) {
        console.error("Error updating genre by ID:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new Error("A genre with this name already exists.");
            }
            if (error.code === "P2025") {
                throw new Error("Genre not found");
            }
            if (error.code === "P2023") {
                throw new Error("Invalid genre ID format.");
            }
        }

        throw new Error("Database error while updating genre.");
    }
};

/**
 * * Delete a genre by ID.
 * @author zelebwr
 * @param id The UUID of the genre to delete.
 * @return The deleted genre object.
 */
export const deleteGenreById = async (id: string): Promise<void> => {
    try {
        const result = await prisma.genre.updateMany({
            where: {
                id: id,
                deletedAt: null, // Only delete if not already deleted
            },
            data: {
                deletedAt: new Date(),
            },
        });
        if (result.count === 0) {
            throw new Error("Genre not found or already removed");
        }
    } catch (error: unknown) {
        console.error("Error deleting genre:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                throw new Error("Genre not found");
            }
            if (error.code === "P2003") {
                throw new Error(
                    "Cannot delete genre when it' still associated with some books."
                );
            }
            if (error.code === "P2023") {
                throw new Error("Invalid genre ID format.");
            }
        }

        if (error instanceof Error && error.message === "Genre not found or already removed") {
            throw error;
        }

        throw new Error("Database error while deleting genre.");
    }
};

/**
 * * Membuat genre baru di database.
 * @author HikariReiziq (diadaptasi dari Gemini)
 */
export const createGenre = async (data: CreateGenreInput): Promise<ApiGenreDetail> => {
    try {
        const newGenre = await prisma.genre.create({
            data: data,
            omit: {
                deletedAt: true,
            },
        });
        return newGenre;
    } catch (error: unknown) {
        console.error("Error creating genre:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new Error("Genre with this name already exists.");
            }
        }

        throw new Error("Database error while creating genre.");
    }
};

/**
 * * Mengambil semua genre dengan filter dan pagination.
 * @author HikariReiziq (diadaptasi dari Gemini)
 */
export const getAllGenres = async (query: ApiGenreQuery): Promise<ApiGenreListResponse> => {
    try {
        const { page = 1, limit = 10, search, orderByName } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const whereCondition: Prisma.GenreWhereInput = {
            deletedAt: null,
        };

        if (search) {
            whereCondition.name = {
                contains: search,
                mode: "insensitive",
            };
        }

        const orderByCondition: Prisma.GenreOrderByWithRelationInput[] = [];

        if (orderByName) {
            orderByCondition.push({ name: orderByName as "asc" | "desc" });
        } else {
            orderByCondition.push({ createdAt: "desc" });
        }

        const genres = await prisma.genre.findMany({
            where: whereCondition,
            skip: skip,
            take: Number(limit),
            orderBy: orderByCondition,
            select: {
                id: true,
                name: true,
            },
        });

        const totalGenres = await prisma.genre.count({
            where: whereCondition,
        });

        return { genres, total: totalGenres };
    } catch (error: unknown) {
        console.error("Error fetching genres:", error);
        throw new Error("Failed to fetch genres");
    }
};
