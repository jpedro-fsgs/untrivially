import { z } from "zod";

export const answerSchema = z.object({
    id: z.string(),
    text: z.string(),
    imageUrl: z.string().url().nullable().optional(),
    isCorrect: z.boolean(),
    questionId: z.string(), // Corrected: Question.id is string
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const questionSchema = z.object({
    id: z.string(),
    title: z.string(),
    imageUrl: z.string().url().nullable().optional(),
    quizId: z.uuid(), // Corrected: Quiz.id is uuid
    createdAt: z.date(),
    updatedAt: z.date(),
    answers: z.array(answerSchema),
});

export const quizSchema = z.object({
    id: z.uuid(),
    subId: z.string(),
    title: z.string(),
    userId: z.uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    questions: z.array(questionSchema),
});

export type Quiz = z.infer<typeof quizSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Answer = z.infer<typeof answerSchema>;

// Request schemas
export const getQuizByIdParamsSchema = z.object({
    id: z.uuid(),
});

export const createQuizOptionSchema = z.object({
    text: z.string(),
    imageUrl: z.string().url().nullable().optional(),
});

export const createQuizQuestionSchema = z
    .object({
        title: z.string(),
        imageUrl: z.string().url().nullable().optional(),
        options: z
            .array(createQuizOptionSchema)
            .min(2, "Must have at least two options"),
        correctOptionIndex: z.number().int().min(0),
    })
    .refine((data) => data.correctOptionIndex < data.options.length, {
        message:
            "Correct option index must be within the bounds of the options array",
        path: ["correctOption"],
    });

export const createQuizBodySchema = z.object({
    title: z.string(),
    questions: z.array(createQuizQuestionSchema),
});

export const updateQuizParamsSchema = z.object({
    id: z.uuid(),
});

export const updateQuizBodySchema = z.object({
    title: z.string().optional(),
    // Questions and Answers updates will need separate endpoints or a more complex strategy
});

export const deleteQuizParamsSchema = z.object({
    id: z.uuid(),
});

// Request schemas for Question management
export const createQuestionParamsSchema = z.object({
    quizId: z.uuid(),
});

export const createQuestionAnswerSchema = z.object({
    text: z.string(),
    imageUrl: z.string().url().nullable().optional(),
    isCorrect: z.boolean(),
});

export const createQuestionBodySchema = z.object({
    title: z.string(),
    imageUrl: z.string().url().nullable().optional(),
    answers: z.array(createQuestionAnswerSchema).min(2, "Must have at least two answers"),
});

export const updateQuestionParamsSchema = z.object({
    quizId: z.uuid(),
    questionId: z.string(),
});

export const updateQuestionBodySchema = z.object({
    title: z.string().optional(),
    imageUrl: z.string().url().nullable().optional(),
});

export const deleteQuestionParamsSchema = z.object({
    quizId: z.uuid(),
    questionId: z.string(),
});

// Request schemas for Answer management
export const createAnswerParamsSchema = z.object({
    quizId: z.uuid(),
    questionId: z.string(),
});

export const createAnswerBodySchema = z.object({
    text: z.string(),
    imageUrl: z.string().url().nullable().optional(),
    isCorrect: z.boolean(),
});

export const updateAnswerParamsSchema = z.object({
    quizId: z.uuid(),
    questionId: z.string(),
    answerId: z.string(),
});

export const updateAnswerBodySchema = z.object({
    text: z.string().optional(),
    imageUrl: z.string().url().nullable().optional(),
    isCorrect: z.boolean().optional(),
});

export const deleteAnswerParamsSchema = z.object({
    quizId: z.uuid(),
    questionId: z.string(),
    answerId: z.string(),
});

// Response schemas
export const getAllQuizzesResponseSchema = z.object({
    quizzes: z.array(quizSchema),
});

export const getQuizByIdResponseSchema = z.object({
    quiz: quizSchema,
});

export const questionResponseSchema = z.object({
    question: questionSchema,
});

export const answerResponseSchema = z.object({
    answer: answerSchema,
});


// Inferred types
export type GetQuizByIdParams = z.infer<typeof getQuizByIdParamsSchema>;
export type CreateQuizBody = z.infer<typeof createQuizBodySchema>;
export type UpdateQuizParams = z.infer<typeof updateQuizParamsSchema>;
export type UpdateQuizBody = z.infer<typeof updateQuizBodySchema>;
export type DeleteQuizParams = z.infer<typeof deleteQuizParamsSchema>;
export type GetAllQuizzesResponse = z.infer<typeof getAllQuizzesResponseSchema>;
export type GetQuizByIdResponse = z.infer<typeof getQuizByIdResponseSchema>;

// Inferred types for Question
export type CreateQuestionParams = z.infer<typeof createQuestionParamsSchema>;
export type CreateQuestionBody = z.infer<typeof createQuestionBodySchema>;
export type UpdateQuestionParams = z.infer<typeof updateQuestionParamsSchema>;
export type UpdateQuestionBody = z.infer<typeof updateQuestionBodySchema>;
export type DeleteQuestionParams = z.infer<typeof deleteQuestionParamsSchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;

// Inferred types for Answer
export type CreateAnswerParams = z.infer<typeof createAnswerParamsSchema>;
export type CreateAnswerBody = z.infer<typeof createAnswerBodySchema>;
export type UpdateAnswerParams = z.infer<typeof updateAnswerParamsSchema>;
export type UpdateAnswerBody = z.infer<typeof updateAnswerBodySchema>;
export type DeleteAnswerParams = z.infer<typeof deleteAnswerParamsSchema>;
export type AnswerResponse = z.infer<typeof answerResponseSchema>;

