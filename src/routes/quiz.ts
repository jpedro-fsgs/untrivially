import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticate } from '../plugins/authenticate'
import {
  createQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
} from '../services/quizService'

export async function quizRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/quizzes',
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const quizzes = await getAllQuizzes(request.user.sub)

      return { quizzes }
    },
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/quizzes/:id',
    {
      onRequest: [authenticate],
    },
    async (request) => {
      const getQuizParams = z.object({
        id: z.string().uuid(),
      })

      const { id } = getQuizParams.parse(request.params)

      const quiz = await getQuizById(id)

      return { quiz }
    },
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/quizzes',
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const createQuizBody = z.object({
        title: z.string(),
        questions: z.any(),
      })

      const { title, questions } = createQuizBody.parse(request.body)

      await createQuiz(title, questions, request.user.sub)

      return reply.status(201).send()
    },
  )

  app.withTypeProvider<ZodTypeProvider>().put(
    '/quizzes/:id',
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const getQuizParams = z.object({
        id: z.string().uuid(),
      })

      const { id } = getQuizParams.parse(request.params)

      const updateQuizBody = z.object({
        title: z.string(),
        questions: z.any(),
      })

      const { title, questions } = updateQuizBody.parse(request.body)

      await updateQuiz(id, title, questions)

      return reply.status(204).send()
    },
  )

  app.withTypeProvider<ZodTypeProvider>().delete(
    '/quizzes/:id',
    {
      onRequest: [authenticate],
    },
    async (request, reply) => {
      const getQuizParams = z.object({
        id: z.string().uuid(),
      })

      const { id } = getQuizParams.parse(request.params)

      await deleteQuiz(id)

      return reply.status(204).send()
    },
  )
}
