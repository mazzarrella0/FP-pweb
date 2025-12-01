// src/routes/book.routes.ts
import { Router } from "express";
import * as bookController from "../controllers/book.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware);

// --- TAMBAHKAN RUTE INI ---
// GET /api/books (harus sebelum /:book_id agar tidak tertukar)
router.get("/", bookController.handleGetAllBooks);
// -------------------------

// POST /api/books
router.post("/", bookController.handleCreateBook);

// GET /api/books/genre/:genre_id
router.get("/genre/:genre_id", bookController.handleGetBooksByGenre);

// GET /api/books/:book_id
router.get("/:book_id", bookController.handleGetBookById);

// PATCH /api/books/:book_id
router.patch("/:book_id", bookController.handleUpdateBook);

// --- TAMBAHKAN RUTE INI ---
// DELETE /api/books/:book_id
router.delete("/:book_id", bookController.handleDeleteBook);
// -------------------------

export default router;
