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
