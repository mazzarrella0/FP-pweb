import { GameStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export type CreateGameInput = {
    hostId: string;
    title: string;
    teamLimit?: number;
};

export type UpdateGameSettingsInput = {
    title?: string;
    teamLimit?: number;
};

const hostSelection = {
    id: true,
    email: true,
    username: true,
};

const gameRelations = {
    host: { select: hostSelection },
    teams: {
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            username: true,
                        },
                    },
                },
            },
        },
        orderBy: { order: "asc" as const },
    },
    rounds: {
        include: {
            categories: {
                include: {
                    clues: true,
                },
            },
        },
        orderBy: { order: "asc" as const },
    },
    clueStates: true,
};

export type GameWithBoard = Prisma.GameGetPayload<{ include: typeof gameRelations }>;

const ensureHostAccess = (game: { hostId: string }, actorId: string) => {
    if (game.hostId !== actorId) {
        throw new Error("Only the host can perform this action");
    }
};

export const createGame = async (input: CreateGameInput): Promise<GameWithBoard> => {
    const { hostId, title, teamLimit = 4 } = input;

    if (!title.trim()) {
        throw new Error("Game title is required");
    }

    const game = await prisma.game.create({
        data: {
            title: title.trim(),
            hostId,
            teamLimit,
            status: GameStatus.LOBBY,
        },
        include: gameRelations,
    });

    return game;
};

export const getGameById = async (gameId: string): Promise<GameWithBoard> => {
    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: gameRelations,
    });

    if (!game) {
        throw new Error("Game not found");
    }

    return game;
};

export const listGamesForHost = async (hostId: string): Promise<GameWithBoard[]> => {
    return prisma.game.findMany({
        where: { hostId },
        include: gameRelations,
        orderBy: { createdAt: "desc" },
    });
};

export const updateGameSettings = async (
    gameId: string,
    data: UpdateGameSettingsInput,
    actorId: string
): Promise<GameWithBoard> => {
    const game = await prisma.game.findUnique({ where: { id: gameId } });

    if (!game) {
        throw new Error("Game not found");
    }

    ensureHostAccess(game, actorId);

    if (game.status !== GameStatus.LOBBY) {
        throw new Error("Game settings are locked once the game starts");
    }

    const nextTitle = data.title?.trim() ?? game.title;
    const nextTeamLimit = data.teamLimit ?? game.teamLimit;

    if (nextTeamLimit < 1) {
        throw new Error("Team limit must be at least 1");
    }

    const updated = await prisma.game.update({
        where: { id: gameId },
        data: {
            title: nextTitle,
            teamLimit: nextTeamLimit,
        },
        include: gameRelations,
    });

    return updated;
};

export const startGame = async (gameId: string, actorId: string): Promise<GameWithBoard> => {
    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: { teams: true },
    });

    if (!game) {
        throw new Error("Game not found");
    }

    ensureHostAccess(game, actorId);

    if (game.status !== GameStatus.LOBBY) {
        throw new Error("Game has already started");
    }

    if (!game.teams.length) {
        throw new Error("Add at least one team before starting the game");
    }

    const started = await prisma.game.update({
        where: { id: gameId },
        data: { status: GameStatus.IN_PROGRESS },
        include: gameRelations,
    });

    return started;
};

export const finishGame = async (gameId: string, actorId: string): Promise<GameWithBoard> => {
    const game = await prisma.game.findUnique({ where: { id: gameId } });

    if (!game) {
        throw new Error("Game not found");
    }

    ensureHostAccess(game, actorId);

    if (game.status !== GameStatus.IN_PROGRESS) {
        throw new Error("Game must be in progress to finish");
    }

    const finished = await prisma.game.update({
        where: { id: gameId },
        data: { status: GameStatus.FINISHED },
        include: gameRelations,
    });

    return finished;
};

export const deleteGame = async (gameId: string, actorId: string): Promise<void> => {
    const game = await prisma.game.findUnique({ where: { id: gameId } });

    if (!game) {
        throw new Error("Game not found");
    }

    ensureHostAccess(game, actorId);

    await prisma.game.delete({ where: { id: gameId } });
};