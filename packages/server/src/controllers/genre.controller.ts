import { Request, Response } from "express";
import * as genreService from "../services/genre.service";

import {
    ApiGenreQuery,
    CreateGenreInput,
    UpdateGenreInput,
} from "@react-express-library/shared";

/**
 * * Handler untuk membuat genre baru (POST /genre).
 * @author HikariReiziq (diadaptasi dari Gemini)
 */
export const handleCreateGenre = async (req: Request, res: Response) => {
    try {
        const genreData = req.body as CreateGenreInput;
        if (!genreData.name) {
            return res.status(400).json({
                success: false,
                message: "Genre name is required",
            });
        }
        const newGenre = await genreService.createGenre(genreData);
        res.status(201).json({
            success: true,
            message: "Genre created successfully",
            data: newGenre,
        });
    } catch (error: unknown) {
        console.error(`[ERROR] Failed to create genre`, error);

        if (error instanceof Error) {
            if (error.message.includes("already exists")) {
                return res.status(409).json({
                    success: false,
                    message: error.message,
                });
            }
            // Other fallback errors
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
 * * Handler untuk mendapatkan semua genre (GET /genre).
 * @author HikariReiziq (diadaptasi dari Gemini)
 */
export const handleGetAllGenres = async (req: Request, res: Response) => {
    try {
        const query = req.query as ApiGenreQuery;
        const result = await genreService.getAllGenres(query);

        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        res.status(200).json({
            success: true,
            message: "Get all genres successfully",
            data: result.genres,
            meta: {
                page,
                limit,
                total: result.total,
                next_page: result.total > page * limit ? page + 1 : null,
                prev_page: page > 1 ? page - 1 : null,
            },
        });
    } catch (error: unknown) {
        console.error(`[ERROR] Failed to get all genres`, error);

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

/**
 * * Handles HTTP Requests to get a genre by ID. (GET /genre/:genre_id)
 * @author zelebwr
 */
export const getGenreDetail = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;

        if (!genre_id) {
            return res.status(400).json({
                success: false,
                message: "Genre ID is required",
            });
        }

        const genre = await genreService.getGenreById(genre_id);

        return res.status(200).json({
            success: true,
            message: "Get genre detail successfully",
            data: genre,
        });
    } catch (error: unknown) {
        console.error(
            `[ERROR] Failed to get genre detail for ID: ${req.params.genre_id}`,
            error
        );
        if (error instanceof Error) {
            if (error.message === "Genre not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error.message === "Invalid genre ID format") {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
        // Generic error
        return res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * * Handles HTTP Requests to update a genre by ID. (PATCH /genre/:genre_id)
 * @author zelebwr
 */
export const updateGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        if (!genre_id) {
            return res.status(400).json({
                success: false,
                message: "Genre ID is required",
            });
        }

        const genreData = req.body as UpdateGenreInput;

        if (!genreData.name) {
            return res.status(400).json({
                success: false,
                message: "Genre name is required",
            });
        }

        const updatedGenre = await genreService.updateGenreById(genre_id, genreData);
        return res.status(200).json({
            success: true,
            message: "Genre updated successfully",
            data: updatedGenre,
        });
    } catch (error: unknown) {
        console.error(
            `[ERROR] Failed to update genre for ID: ${req.params.genre_id}`,
            error
        );

        if (error instanceof Error) {
            if (error.message.includes("already exists")) {
                return res.status(409).json({
                    // 409 Conflict
                    success: false,
                    message: error.message,
                });
            }
            if (error.message.includes("Genre not found")) {
                return res.status(404).json({
                    // 404 Not Found
                    success: false,
                    message: error.message,
                });
            }
            if (error.message.includes("Invalid genre ID format")) {
                return res.status(400).json({
                    // 400 Bad Request
                    success: false,
                    message: error.message,
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
        // Generic error
        return res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * * Handles HTTP Requests to delete a genre by ID.
 * @author zelebwr
 */
export const deleteGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;

        if (!genre_id) {
            return res.status(400).json({
                success: false,
                message: "Genre ID is required",
            });
        }

        await genreService.deleteGenreById(genre_id);
        return res.status(200).json({
            success: true,
            message: "Genre removed successfully",
        });
    } catch (error) {
        console.error(
            `[ERROR] Failed to remove genre for ID: ${req.params.genre_id}`,
            error
        );

        let statusCode = 500;
        let message = "Internal server error";
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";

        if (error instanceof Error) {
            if (error.message.includes("Genre not found")) {
                statusCode = 404; // 404 Not Found
                message = error.message;
            } else if (error.message.includes("Cannot delete genre")) {
                statusCode = 400; // 400 Bad Request
                message = error.message;
            } else if (
                error.message.includes("still associated with some books")
            ) {
                statusCode = 400; // 400 Bad Request
                message = error.message;
            }
            else if (error.message.includes("already removed")) {
                statusCode = 404; // 404 Not Found
                message = error.message;
            }
        }

        return res.status(statusCode).json({
            success: false,
            message: message,
            error: errorMessage,
        });
    }
};
