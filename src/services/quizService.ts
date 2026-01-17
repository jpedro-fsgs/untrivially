import { prisma } from "../lib/prisma";
import { generateShortId } from "../lib/utils";
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

/**
 * Creates a new quiz and stores it in the database.
 *
 * This function takes the quiz data from the request body, which includes the title
 * and a list of questions. Each question has a title, an array of options, and the
 * index of the correct option.
 *
 * The function performs the following transformations:
 * 1. Generates a short, unique `subId` for the quiz for user-facing identification.
 * 2. Maps over each question in the input:
 *    a. Generates a unique `questionId` for each question, prefixed with the quiz's `subId`.
 *    b. Maps over each option for the question:
 *       i. Generates a unique `optionId` for each option, prefixed with the `questionId`.
 *       ii. Returns the option text and the new `optionId`.
 *    c. Determines the `correctOptionId` by using the `correctOptionIndex` from the
 *       input to look up the newly generated `optionId` in the transformed options array.
 *    d. Returns the transformed question, including the new IDs and the `correctOptionId`.
 * 3. Creates the quiz in the database with the transformed data, associating it with the `userId`.
 *
 * @param data - The quiz data, conforming to the `CreateQuizBody` schema.
 * @param userId - The ID of the user creating the quiz.
 * @returns The newly created quiz object from the database.
 */
export async function createQuiz(data: CreateQuizBody, userId: string) {
    const subId = generateShortId(); // Generate a short ID for the quiz itself.

    const parsedData = {
        ...data,
        questions: data.questions.map((question) => {
            const questionId = `${subId}-${generateShortId()}`; // Generate a unique ID for the question.

            // Transform options and generate their unique IDs.
            const optionsWithIds = question.options.map((option) => ({
                ...option,
                optionId: `${questionId}-${generateShortId()}`, // Generate a unique ID for the option.
            }));

            // Find the correct option's ID using the index provided in the input.
            const correctOptionId =
                optionsWithIds[question.correctOptionIndex]?.optionId;

            // Refine the question object to be stored in the database.
            const { correctOptionIndex, ...remaningQuestionData } = question;

            return {
                ...remaningQuestionData,
                questionId,
                options: optionsWithIds,
                correctOptionId,
            };
        }),
    };

    return prisma.quiz.create({
        data: {
            ...parsedData,
            userId,
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
