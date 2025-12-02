import { GameStatus, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma";

export type CreateTeamInput = {
    gameId: string;
    name: string;
    actorId: string;
    makeCaptain?: boolean;
};

export type JoinTeamInput = {
    teamId: string;
    userId: string;
    isCaptain?: boolean;
};

export type AdjustScoreInput = {
    teamId: string;
    delta: number;
    actorId: string;
};

const teamInclude = {
    members: {
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                },
            },
        },
        orderBy: { joinedAt: "asc" as const },
    },
};

export type TeamWithMembers = Prisma.TeamGetPayload<{ include: typeof teamInclude }>;

const ensureLobbyGame = (game: { status: GameStatus }) => {
    if (game.status !== GameStatus.LOBBY) {
        throw new Error("Teams can only be managed while the game is in the lobby state");
    }
};

const ensureHostOrOperator = (user: { role: UserRole }, action: string) => {
    if (user.role !== UserRole.HOST && user.role !== UserRole.OPERATOR) {
        throw new Error(`${action} requires host or operator privileges`);
    }
};

export const createTeam = async (input: CreateTeamInput): Promise<TeamWithMembers> => {
    const { gameId, name, actorId, makeCaptain = true } = input;

    if (!name.trim()) {
        throw new Error("Team name is required");
    }

    const [game, actor] = await Promise.all([
        prisma.game.findUnique({
            where: { id: gameId },
            include: { teams: true },
        }),
        prisma.user.findUnique({ where: { id: actorId } }),
    ]);

    if (!game) {
        throw new Error("Game not found");
    }

    if (!actor) {
        throw new Error("Actor not found");
    }

    ensureLobbyGame(game);

    if (game.teams.length >= game.teamLimit) {
        throw new Error("Team limit reached for this game");
    }

    const nextOrder = game.teams.length + 1;

    const team = await prisma.team.create({
        data: {
            name: name.trim(),
            order: nextOrder,
            gameId,
            members: makeCaptain
                ? {
                    create: {
                        userId: actorId,
                        isCaptain: true,
                    },
                }
                : undefined,
        },
        include: teamInclude,
    });

    return team;
};

export const listTeams = async (gameId: string): Promise<TeamWithMembers[]> => {
    return prisma.team.findMany({
        where: { gameId },
        include: teamInclude,
        orderBy: { order: "asc" },
    });
};

export const joinTeam = async (input: JoinTeamInput): Promise<TeamWithMembers> => {
    const { teamId, userId, isCaptain = false } = input;

    const membership = await prisma.teamMember.findFirst({
        where: { teamId, userId },
    });

    if (membership) {
        throw new Error("User already joined this team");
    }

    const team = await prisma.team.update({
        where: { id: teamId },
        data: {
            members: {
                create: {
                    userId,
                    isCaptain,
                },
            },
        },
        include: teamInclude,
    });

    return team;
};

export const leaveTeam = async (teamId: string, userId: string): Promise<TeamWithMembers> => {
    const membership = await prisma.teamMember.findFirst({ where: { teamId, userId } });

    if (!membership) {
        throw new Error("Membership not found");
    }

    await prisma.teamMember.delete({ where: { id: membership.id } });

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: teamInclude,
    });

    if (!team) {
        throw new Error("Team not found");
    }

    return team;
};

export const removeTeam = async (teamId: string, actorId: string): Promise<void> => {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { game: true },
    });

    if (!team) {
        throw new Error("Team not found");
    }

    ensureLobbyGame(team.game);

    if (team.game.hostId !== actorId) {
        throw new Error("Only the host can remove teams");
    }

    await prisma.team.delete({ where: { id: teamId } });

    // Re-order remaining teams so the lobby display stays consistent
    const teams = await prisma.team.findMany({
        where: { gameId: team.gameId },
        orderBy: { order: "asc" },
    });

    await Promise.all(
        teams.map((t, index) =>
            prisma.team.update({
                where: { id: t.id },
                data: { order: index + 1 },
            })
        )
    );
};

export const adjustScore = async (input: AdjustScoreInput): Promise<TeamWithMembers> => {
    const { teamId, delta, actorId } = input;

    const [team, actor] = await Promise.all([
        prisma.team.findUnique({
            where: { id: teamId },
            include: { game: true },
        }),
        prisma.user.findUnique({ where: { id: actorId } }),
    ]);

    if (!team) {
        throw new Error("Team not found");
    }

    if (!actor) {
        throw new Error("Actor not found");
    }

    if (team.game.hostId !== actorId) {
        ensureHostOrOperator(actor, "Updating team score");
    }

    const updated = await prisma.team.update({
        where: { id: teamId },
        data: { score: { increment: delta } },
        include: teamInclude,
    });

    return updated;
};
