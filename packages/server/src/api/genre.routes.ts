import { Router } from "express";
import * as genreController from "../controllers/genre.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

router.use(authMiddleware); // Apply authentication middleware to all routes

// Rute untuk membuat genre baru (POST /api/genre)
router.post("/", genreController.handleCreateGenre);

// Rute untuk mendapatkan semua genre (GET /api/genre)
router.get("/", genreController.handleGetAllGenres);

// Rute dari teman Anda untuk mendapatkan detail genre
router.get("/:genre_id", genreController.getGenreDetail);

// Rute dari teman Anda untuk mengupdate genre
router.patch("/:genre_id", genreController.updateGenre);

// Rute dari teman Anda untuk menghapus genre
router.delete("/:genre_id", genreController.deleteGenre);

export default router;
