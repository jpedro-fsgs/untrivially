import { prisma } from "../lib/prisma";
import { CreateQuizBody, UpdateQuizBody } from "../schemas/quiz";

export async function getAllQuizzes(userId: string) {
    return prisma.quiz.findMany({
        where: {
            userId,
        },
    });
}

export async function getQuizById(id: string) {
    return prisma.quiz.findUnique({
        where: {
            id,
        },
    });
}

export async function createQuiz(data: CreateQuizBody, userId: string) {
    return prisma.quiz.create({
        data: {
            ...data,
            userId,
        },
    });
}

export async function updateQuiz(id: string, data: UpdateQuizBody) {
    return prisma.quiz.update({
        where: {
            id,
        },
        data,
    });
}

export async function deleteQuiz(id: string) {
    return prisma.quiz.delete({
        where: {
            id,
        },
    });
}
