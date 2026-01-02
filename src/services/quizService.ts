import { prisma } from "../lib/prisma";


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

export async function createQuiz(
    title: string,
    questions: any,
    userId: string
) {
    return prisma.quiz.create({
        data: {
            title,
            questions,
            userId,
        },
    });
}

export async function updateQuiz(id: string, title: string, questions: any) {
    return prisma.quiz.update({
        where: {
            id,
        },
        data: {
            title,
            questions,
        },
    });
}

export async function deleteQuiz(id: string) {
    return prisma.quiz.delete({
        where: {
            id,
        },
    });
}
