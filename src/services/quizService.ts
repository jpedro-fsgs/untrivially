import { prisma } from "../lib/prisma";
import { generateShortId } from "../lib/utils";
import { CreateQuizBody, UpdateQuizBody, CreateQuestionBody, UpdateQuestionBody, CreateAnswerBody, UpdateAnswerBody } from "../schemas/quiz";

// Helper function to find a quiz and verify ownership
async function findQuizAndVerifyOwnership(userId: string, quizId: string) {
    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: { include: { answers: true } } },
    });

    if (!quiz || quiz.userId !== userId) {
        return null;
    }
    return quiz;
}

export async function getAllQuizzes(userId: string) {
    return prisma.quiz.findMany({
        where: {
            userId,
        },
        include: {
            questions: {
                include: {
                    answers: true,
                },
            },
        },
    });
}

export async function getQuizById(id: string) {
    return prisma.quiz.findUnique({
        where: {
            id,
        },
        include: {
            questions: {
                include: {
                    answers: true,
                },
            },
        },
    });
}

/**
 * Creates a new quiz and stores it in the database using a single, atomic nested write.
 * This is the robust and idiomatic way to create a quiz with its questions and answers.
 *
 * @param data - The quiz data, conforming to the `CreateQuizBody` schema.
 * @param userId - The ID of the user creating the quiz.
 * @returns The newly created quiz object from the database.
 */
export async function createQuiz(data: CreateQuizBody, userId: string) {
    const subId = generateShortId();

    const questionsData = data.questions.map((question) => {
        const questionId = `${subId}-${generateShortId()}`;
        const optionsWithIds = question.options.map((option) => ({
            id: `${questionId}-${generateShortId()}`,
            text: option.text,
            imageUrl: option.imageUrl,
        }));
        const correctOptionId = optionsWithIds[question.correctOptionIndex]?.id;

        return {
            id: questionId,
            title: question.title,
            imageUrl: question.imageUrl,
            answers: {
                create: optionsWithIds.map((opt) => ({
                    id: opt.id,
                    text: opt.text,
                    imageUrl: opt.imageUrl,
                    isCorrect: opt.id === correctOptionId,
                })),
            },
        };
    });

    return prisma.quiz.create({
        data: {
            title: data.title,
            userId,
            subId,
            questions: {
                create: questionsData,
            },
        },
        include: {
            questions: {
                include: {
                    answers: true,
                },
            },
        },
    });
}

export async function updateQuiz(
    id: string,
    data: UpdateQuizBody,
    userId: string
) {
    return prisma.quiz.updateMany({
        where: {
            id,
            userId,
        },
        data,
    });
}

export async function deleteQuiz(id: string, userId: string) {
    return prisma.quiz.deleteMany({
        where: {
            id,
            userId,
        },
    });
}

// Granular Question Management Services
export async function createQuestion(userId: string, quizId: string, data: CreateQuestionBody) {
    const quiz = await findQuizAndVerifyOwnership(userId, quizId);
    if (!quiz) return null;

    return prisma.$transaction(async (prisma) => {
        const questionId = `${quiz.subId}-${generateShortId()}`;

        const answersToCreate = data.answers.map((answer) => ({
            id: `${questionId}-${generateShortId()}`,
            text: answer.text,
            imageUrl: answer.imageUrl,
            isCorrect: answer.isCorrect,
        }));

        const question = await prisma.question.create({
            data: {
                id: questionId,
                title: data.title,
                imageUrl: data.imageUrl,
                quizId: quiz.id,
                answers: {
                    createMany: {
                        data: answersToCreate,
                    },
                },
            },
            include: { answers: true },
        });

        // Ensure only one correct answer
        if (answersToCreate.some(a => a.isCorrect)) {
            await prisma.answer.updateMany({
                where: {
                    questionId: question.id,
                    id: { not: answersToCreate.find(a => a.isCorrect)?.id },
                },
                data: { isCorrect: false },
            });
        }

        return question;
    });
}

export async function updateQuestion(userId: string, quizId: string, questionId: string, data: UpdateQuestionBody) {
    const quiz = await findQuizAndVerifyOwnership(userId, quizId);
    if (!quiz) return null;

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.quizId !== quiz.id) return null;

    return prisma.question.update({
        where: { id: questionId },
        data: {
            title: data.title,
            imageUrl: data.imageUrl,
        },
        include: { answers: true },
    });
}

export async function deleteQuestion(userId: string, quizId: string, questionId: string) {
    const quiz = await findQuizAndVerifyOwnership(userId, quizId);
    if (!quiz) return null;

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.quizId !== quiz.id) return null;

    const { count } = await prisma.question.deleteMany({
        where: { id: questionId, quizId: quiz.id },
    });
    return { count };
}

// Granular Answer Management Services
export async function createAnswer(userId: string, quizId: string, questionId: string, data: CreateAnswerBody) {
    const quiz = await findQuizAndVerifyOwnership(userId, quizId);
    if (!quiz) return null;

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { answers: true },
    });
    if (!question || question.quizId !== quiz.id) return null;

    if (data.isCorrect) {
        // Unset other correct answers if this one is being set as correct
        await prisma.answer.updateMany({
            where: { questionId: question.id, isCorrect: true },
            data: { isCorrect: false },
        });
    }

    const answerId = `${question.id}-${generateShortId()}`;
    return prisma.answer.create({
        data: {
            id: answerId,
            text: data.text,
            imageUrl: data.imageUrl,
            isCorrect: data.isCorrect,
            questionId: question.id,
        },
    });
}

export async function updateAnswer(userId: string, quizId: string, questionId: string, answerId: string, data: UpdateAnswerBody) {
    const quiz = await findQuizAndVerifyOwnership(userId, quizId);
    if (!quiz) return null;

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { answers: true },
    });
    if (!question || question.quizId !== quiz.id) return null;

    const answer = await prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer || answer.questionId !== question.id) return null;

    if (data.isCorrect) {
        // If this answer is being set as correct, unset others
        await prisma.answer.updateMany({
            where: { questionId: question.id, id: { not: answerId }, isCorrect: true },
            data: { isCorrect: false },
        });
    }

    return prisma.answer.update({
        where: { id: answerId },
        data: {
            text: data.text,
            imageUrl: data.imageUrl,
            isCorrect: data.isCorrect,
        },
    });
}

export async function deleteAnswer(userId: string, quizId: string, questionId: string, answerId: string) {
    const quiz = await findQuizAndVerifyOwnership(userId, quizId);
    if (!quiz) return null;

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { answers: true },
    });
    if (!question || question.quizId !== quiz.id) return null;

    if (question.answers.length <= 2) { // Ensure at least 2 answers remain
        return { count: 0, error: "A question must have at least two answers." };
    }

    const answer = await prisma.answer.findUnique({ where: { id: answerId } });
    if (!answer || answer.questionId !== question.id) return null;

    const { count } = await prisma.answer.deleteMany({
        where: { id: answerId, questionId: question.id },
    });
    return { count };
}
