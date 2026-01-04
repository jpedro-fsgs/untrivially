import { z } from 'zod'

export const quizSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  questions: z.any(),
  userId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Quiz = z.infer<typeof quizSchema>

// Request schemas
export const getQuizByIdParamsSchema = z.object({
  id: z.uuid(),
})

export const createQuizBodySchema = z.object({
  title: z.string(),
  questions: z.any(),
})

export const updateQuizParamsSchema = z.object({
  id: z.uuid(),
})

export const updateQuizBodySchema = z.object({
  title: z.string(),
  questions: z.any(),
})

export const deleteQuizParamsSchema = z.object({
  id: z.uuid(),
})

// Response schemas
export const getAllQuizzesResponseSchema = z.object({
  quizzes: z.array(quizSchema),
})

export const getQuizByIdResponseSchema = z.object({
  quiz: quizSchema,
})

// Inferred types
export type GetQuizByIdParams = z.infer<typeof getQuizByIdParamsSchema>
export type CreateQuizBody = z.infer<typeof createQuizBodySchema>
export type UpdateQuizParams = z.infer<typeof updateQuizParamsSchema>
export type UpdateQuizBody = z.infer<typeof updateQuizBodySchema>
export type DeleteQuizParams = z.infer<typeof deleteQuizParamsSchema>
export type GetAllQuizzesResponse = z.infer<typeof getAllQuizzesResponseSchema>
export type GetQuizByIdResponse = z.infer<typeof getQuizByIdResponseSchema>
