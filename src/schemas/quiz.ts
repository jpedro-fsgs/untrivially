import { z } from "zod";

export const optionSchema = z.object({
    optionId: z.string(),
    text: z.string(),
    imageUrl: z.url().optional(),
});

export const questionSchema = z
    .object({
        questionId: z.string(),
        title: z.string(),
        imageUrl: z.url().optional(),
        options: z.array(optionSchema).min(2, "Must have at least two options"),
        correctOptionId: z.string(),
    })
    .refine(
        (data) =>
            data.options.some(
                (option) => option.optionId === data.correctOptionId
            ),
        {
            message:
                "Correct option must match one of the associated option IDs",
            path: ["correctOptionId"],
        }
    );

export const quizSchema = z.object({
    id: z.uuid(),
    title: z.string(),
    questions: z.array(questionSchema),
    userId: z.uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Quiz = z.infer<typeof quizSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Option = z.infer<typeof optionSchema>;

// Request schemas
export const getQuizByIdParamsSchema = z.object({
    id: z.uuid(),
});

export const createQuizOptionSchema = z.object({
    text: z.string(),
    imageUrl: z.url().optional(),
});

export const createQuizQuestionSchema = z
    .object({
        title: z.string(),
        imageUrl: z.url().optional(),
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
    questions: z.array(questionSchema).optional(),
});

export const deleteQuizParamsSchema = z.object({
    id: z.uuid(),
});

// Response schemas
export const getAllQuizzesResponseSchema = z.object({
    quizzes: z.array(quizSchema),
});

export const getQuizByIdResponseSchema = z.object({
    quiz: quizSchema,
});

// Inferred types
export type GetQuizByIdParams = z.infer<typeof getQuizByIdParamsSchema>;
export type CreateQuizBody = z.infer<typeof createQuizBodySchema>;
export type UpdateQuizParams = z.infer<typeof updateQuizParamsSchema>;
export type UpdateQuizBody = z.infer<typeof updateQuizBodySchema>;
export type DeleteQuizParams = z.infer<typeof deleteQuizParamsSchema>;
export type GetAllQuizzesResponse = z.infer<typeof getAllQuizzesResponseSchema>;
export type GetQuizByIdResponse = z.infer<typeof getQuizByIdResponseSchema>;
