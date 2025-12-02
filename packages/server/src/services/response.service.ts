import { ClueBoardState, Prisma, UserRole } from "@prisma/client";
import { prisma } from "../config/prisma";

export type SubmitResponseInput = {
    clueId: string;
    teamId: string;
    submittedById: string;
    answer: string;
};

export type ValidateResponseInput = {
    responseId: string;
    isCorrect: boolean;
    awardedValue?: number;
    operatorId: string;
};

const responseInclude = {
    team: {
        include: {
            members: true,
        },
    },
    clue: true,
    submittedBy: {
        select: {
            id: true,
            email: true,
            username: true,
        },
    },
    validatedBy: {
        select: {
            id: true,
            email: true,
            username: true,
        },
    },
};

export type TeamResponseWithRelations = Prisma.TeamResponseGetPayload<{ include: typeof responseInclude }>;

const ensureOperator = (user: { role: UserRole }) => {
    if (user.role !== UserRole.OPERATOR && user.role !== UserRole.HOST) {
        throw new Error("Only operators or hosts can validate responses");
    }
};

export const submitResponse = async (
    input: SubmitResponseInput
): Promise<TeamResponseWithRelations> => {
    const { clueId, teamId, submittedById, answer } = input;

    const membership = await prisma.teamMember.findFirst({
        where: { teamId, userId: submittedById },
    });

    if (!membership) {
        throw new Error("Only team members can submit answers for their team");
    }

    const response = await prisma.teamResponse.create({
        data: {
            teamId,
            clueId,
            submittedById,
            submittedAnswer: answer,
        },
        include: responseInclude,
    });

    return response;
};

export const listResponsesForClue = async (
    clueId: string
): Promise<TeamResponseWithRelations[]> => {
    return prisma.teamResponse.findMany({
        where: { clueId },
        include: responseInclude,
        orderBy: { createdAt: "asc" },
    });
};

export const validateResponse = async (
    input: ValidateResponseInput
): Promise<TeamResponseWithRelations> => {
    const { responseId, isCorrect, awardedValue, operatorId } = input;

    const operator = await prisma.user.findUnique({ where: { id: operatorId } });

    if (!operator) {
        throw new Error("Operator not found");
    }

    ensureOperator(operator);

    const response = await prisma.teamResponse.findUnique({
        where: { id: responseId },
        include: {
            clue: true,
        },
    });

    if (!response) {
        throw new Error("Response not found");
    }

    const scoreDelta =
        awardedValue ?? (isCorrect ? response.clue.value : -response.clue.value);

    const updated = await prisma.$transaction(async (tx) => {
        const updatedResponse = await tx.teamResponse.update({
            where: { id: responseId },
            data: {
                isCorrect,
                awardedValue: scoreDelta,
                validatedById: operatorId,
                validatedAt: new Date(),
            },
            include: responseInclude,
        });

        if (scoreDelta !== 0) {
            await tx.team.update({
                where: { id: response.teamId },
                data: { score: { increment: scoreDelta } },
            });
        }

        const clueState = await tx.clueState.findFirst({ where: { clueId: response.clueId } });

        if (clueState) {
            await tx.clueState.update({
                where: { id: clueState.id },
                data: {
                    state: isCorrect
                        ? ClueBoardState.CORRECT
                        : ClueBoardState.INCORRECT,
                    resolvedById: operatorId,
                },
            });
        }

        return updatedResponse;
    });

    return updated;
};
