import { GameStatus, Prisma, RoundType } from "@prisma/client";
import { prisma } from "../config/prisma";

export type ClueTemplateInput = {
    question: string;
    answer: string;
    value: number;
    mediaUrl?: string | null;
    isDailyDouble?: boolean;
};

export type CategoryTemplateInput = {
    title: string;
    order?: number;
    clues: ClueTemplateInput[];
};

export type CreateRoundInput = {
    actorId: string;
    gameId: string;
    type?: RoundType;
    order?: number;
    categories: CategoryTemplateInput[];
};

const roundInclude = {
    categories: {
        include: {
            clues: {
                orderBy: { value: "asc" as const },
            },
        },
        orderBy: { order: "asc" as const },
    },
};

export type RoundWithBoard = Prisma.RoundGetPayload<{ include: typeof roundInclude }>;

const ensureHost = (game: { hostId: string }, actorId: string) => {
    if (game.hostId !== actorId) {
        throw new Error("Only the host can manage rounds");
    }
};

export const listRounds = async (gameId: string): Promise<RoundWithBoard[]> => {
    return prisma.round.findMany({
        where: { gameId },
        include: roundInclude,
        orderBy: { order: "asc" },
    });
};

export const createRound = async (input: CreateRoundInput): Promise<RoundWithBoard> => {
    const { actorId, gameId, order, type = RoundType.JEOPARDY, categories } = input;

    if (!categories.length) {
        throw new Error("At least one category is required");
    }

    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: { rounds: true },
    });

    if (!game) {
        throw new Error("Game not found");
    }

    ensureHost(game, actorId);

    if (game.status !== GameStatus.LOBBY) {
        throw new Error("Rounds can only be edited while the game is in the lobby state");
    }

    const roundOrder = order ?? game.rounds.length + 1;

    const round = await prisma.round.create({
        data: {
            gameId,
            type,
            order: roundOrder,
            categories: {
                create: categories.map((category, index) => ({
                    title: category.title,
                    order: category.order ?? index + 1,
                    clues: {
                        create: category.clues.map((clue) => ({
                            question: clue.question,
                            answer: clue.answer,
                            value: clue.value,
                            mediaUrl: clue.mediaUrl ?? null,
                            isDailyDouble: clue.isDailyDouble ?? false,
                        })),
                    },
                })),
            },
        },
        include: roundInclude,
    });

    return round;
};

export const deleteRound = async (roundId: string, actorId: string): Promise<void> => {
    const round = await prisma.round.findUnique({
        where: { id: roundId },
        include: { game: true },
    });

    if (!round) {
        throw new Error("Round not found");
    }

    ensureHost(round.game, actorId);

    if (round.game.status !== GameStatus.LOBBY) {
        throw new Error("Cannot delete rounds once the game has started");
    }

    await prisma.round.delete({ where: { id: roundId } });

    const remainingRounds = await prisma.round.findMany({
        where: { gameId: round.gameId },
        orderBy: { order: "asc" },
    });

    await Promise.all(
        remainingRounds.map((r, index) =>
            prisma.round.update({
                where: { id: r.id },
                data: { order: index + 1 },
            })
        )
    );
};

export const updateRoundOrder = async (
    roundId: string,
    newOrder: number,
    actorId: string
): Promise<RoundWithBoard> => {
    const round = await prisma.round.findUnique({
        where: { id: roundId },
        include: { game: true },
    });

    if (!round) {
        throw new Error("Round not found");
    }

    ensureHost(round.game, actorId);

    if (round.game.status !== GameStatus.LOBBY) {
        throw new Error("Cannot reorder rounds once the game has started");
    }

    const updated = await prisma.round.update({
        where: { id: roundId },
        data: { order: newOrder },
        include: roundInclude,
    });

    return updated;
};
