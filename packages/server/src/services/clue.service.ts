import { ClueBoardState, GameStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export type SelectClueInput = {
    clueId: string;
    teamId: string;
    actorId: string;
};

export type UpdateClueStateInput = {
    clueId: string;
    state: ClueBoardState;
    resolvedById: string;
};

const clueInclude = {
    category: {
        include: {
            round: {
                include: {
                    game: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                        },
                    },
                },
            },
        },
    },
};

export type ClueWithContext = Prisma.ClueGetPayload<{ include: typeof clueInclude }>;

const ensureGameInProgress = (game: { status: GameStatus }) => {
    if (game.status !== GameStatus.IN_PROGRESS) {
        throw new Error("Clues can only be selected while the game is in progress");
    }
};

const loadClue = async (clueId: string): Promise<ClueWithContext> => {
    const clue = await prisma.clue.findUnique({ where: { id: clueId }, include: clueInclude });

    if (!clue) {
        throw new Error("Clue not found");
    }

    return clue;
};

export const getClueById = loadClue;

export const selectClue = async (input: SelectClueInput) => {
    const { clueId, teamId, actorId } = input;
    const clue = await loadClue(clueId);

    ensureGameInProgress(clue.category.round.game);

    const [team, state] = await Promise.all([
        prisma.team.findUnique({ where: { id: teamId } }),
        prisma.clueState.findFirst({ where: { clueId } }),
    ]);

    if (!team) {
        throw new Error("Team not found");
    }

    if (team.gameId !== clue.category.round.gameId) {
        throw new Error("Team and clue do not belong to the same game");
    }

    const isActorMember = await prisma.teamMember.findFirst({
        where: { teamId, userId: actorId },
    });

    if (!isActorMember) {
        throw new Error("Only team members can select a clue on behalf of their team");
    }

    if (state && state.state !== ClueBoardState.AVAILABLE) {
        throw new Error("Clue has already been taken");
    }

    const pendingState = state
        ? await prisma.clueState.update({
            where: { id: state.id },
            data: {
                state: ClueBoardState.PENDING,
                pickedByTeamId: teamId,
            },
        })
        : await prisma.clueState.create({
            data: {
                clueId,
                gameId: clue.category.round.gameId,
                state: ClueBoardState.PENDING,
                pickedByTeamId: teamId,
            },
        });

    return pendingState;
};

export const updateClueState = async (input: UpdateClueStateInput) => {
    const { clueId, state, resolvedById } = input;
    const clue = await loadClue(clueId);

    const operator = await prisma.user.findUnique({ where: { id: resolvedById } });

    if (!operator) {
        throw new Error("Operator not found");
    }

    const existingState = await prisma.clueState.findFirst({ where: { clueId } });

    if (!existingState) {
        throw new Error("Clue state not found");
    }

    const updated = await prisma.clueState.update({
        where: { id: existingState.id },
        data: {
            state,
            resolvedById,
        },
    });

    return { ...updated, clue };
};

export const resetClueState = async (clueId: string, actorId: string) => {
    const clue = await loadClue(clueId);

    const operator = await prisma.user.findUnique({ where: { id: actorId } });

    if (!operator) {
        throw new Error("Operator not found");
    }

    const state = await prisma.clueState.findFirst({ where: { clueId } });

    if (!state) {
        return prisma.clueState.create({
            data: {
                clueId,
                gameId: clue.category.round.gameId,
                state: ClueBoardState.AVAILABLE,
            },
        });
    }

    return prisma.clueState.update({
        where: { id: state.id },
        data: {
            state: ClueBoardState.AVAILABLE,
            pickedByTeamId: null,
            resolvedById: null,
        },
    });
};
