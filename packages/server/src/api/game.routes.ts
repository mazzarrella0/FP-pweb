import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authMiddleware, requireRoles } from "../middlewares/auth.middleware";
import {
    createGameController,
    listGamesController,
    getGameController,
    updateGameController,
    startGameController,
    finishGameController,
    deleteGameController,
} from "../controllers/game.controller";

const router = Router();

router.use(authMiddleware);
router.post("/", requireRoles(UserRole.HOST), createGameController);
router.get("/", requireRoles(UserRole.HOST), listGamesController);
router.get("/:gameId", getGameController);
router.patch("/:gameId", requireRoles(UserRole.HOST), updateGameController);
router.post("/:gameId/start", requireRoles(UserRole.HOST), startGameController);
router.post("/:gameId/finish", requireRoles(UserRole.HOST), finishGameController);
router.delete("/:gameId", requireRoles(UserRole.HOST), deleteGameController);

export default router;