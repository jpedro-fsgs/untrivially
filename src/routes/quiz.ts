import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../plugins/authenticate";
import {
    createQuiz,
    deleteQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
} from "../services/quizService";
import {
    quizSchema,
    getQuizByIdParamsSchema,
    createQuizBodySchema,
    updateQuizParamsSchema,
    updateQuizBodySchema,
    deleteQuizParamsSchema,
    getAllQuizzesResponseSchema,
    getQuizByIdResponseSchema,
    GetQuizByIdParams,
    CreateQuizBody,
    UpdateQuizParams,
    UpdateQuizBody,
    DeleteQuizParams,
} from "../schemas/quiz";

export async function quizRoutes(app: FastifyInstance) {
    app.get(
        "/quizzes",
        {
            schema: {
                tags: ["quizzes"],
                summary: "Get all quizzes for the authenticated user",
                security: [{ cookieAuth: [] }],
                response: {
                    200: getAllQuizzesResponseSchema,
                },
            },
            onRequest: [authenticate],
        },
        async (request) => {
            const quizzes = await getAllQuizzes(request.user.sub);
            return { quizzes };
        }
    );

    app.get<{ Params: GetQuizByIdParams }>(
        "/quizzes/:id",
        {
            schema: {
                tags: ["quizzes"],
                summary: "Get a quiz by ID",
                security: [{ cookieAuth: [] }],
                params: getQuizByIdParamsSchema,
                response: {
                    200: getQuizByIdResponseSchema,
                    404: z.object({ message: z.string() }),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { id } = request.params;
            const quiz = await getQuizById(id);

            if (!quiz) {
                return reply.status(404).send({ message: 'Quiz not found' });
            }

            return { quiz };
        }
    );

    app.post<{ Body: CreateQuizBody }>(
        "/quizzes",
        {
            schema: {
                tags: ["quizzes"],
                summary: "Create a new quiz",
                security: [{ cookieAuth: [] }],
                body: createQuizBodySchema,
                response: {
                    201: z.null(),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            await createQuiz(request.body, request.user.sub);
            return reply.status(201).send();
        }
    );

    app.put<{ Params: UpdateQuizParams; Body: UpdateQuizBody }>(
        "/quizzes/:id",
        {
            schema: {
                tags: ["quizzes"],
                summary: "Update a quiz",
                security: [{ cookieAuth: [] }],
                params: updateQuizParamsSchema,
                body: updateQuizBodySchema,
                response: {
                    204: z.null(),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { id } = request.params;
            await updateQuiz(id, request.body);
            return reply.status(204).send();
        }
    );

    app.delete<{ Params: DeleteQuizParams }>(
        "/quizzes/:id",
        {
            schema: {
                tags: ["quizzes"],
                summary: "Delete a quiz",
                security: [{ cookieAuth: [] }],
                params: deleteQuizParamsSchema,
                response: {
                    204: z.null(),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { id } = request.params;
            await deleteQuiz(id);
            return reply.status(204).send();
        }
    );
}
