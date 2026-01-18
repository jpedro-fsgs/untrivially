import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../plugins/authenticate";
import {
    createQuiz,
    deleteQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createAnswer,
    updateAnswer,
    deleteAnswer,
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
    createQuestionParamsSchema,
    createQuestionBodySchema,
    updateQuestionParamsSchema,
    updateQuestionBodySchema,
    deleteQuestionParamsSchema,
    questionResponseSchema,
    createAnswerParamsSchema,
    createAnswerBodySchema,
    updateAnswerParamsSchema,
    updateAnswerBodySchema,
    deleteAnswerParamsSchema,
    answerResponseSchema,
    CreateQuestionParams,
    CreateQuestionBody,
    UpdateQuestionParams,
    UpdateQuestionBody,
    DeleteQuestionParams,
    CreateAnswerParams,
    CreateAnswerBody,
    UpdateAnswerParams,
    UpdateAnswerBody,
    DeleteAnswerParams,
} from "../schemas/quiz";

export async function quizRoutes(app: FastifyInstance) {
    app.get(
        "/quizzes",
        {
            schema: {
                tags: ["quizzes"],
                summary: "Get all quizzes for the authenticated user",
                security: [{ bearerAuth: [] }],
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
                security: [{ bearerAuth: [] }],
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
                return reply.status(404).send({ message: "Quiz not found" });
            }

            console.log(quiz);

            return { quiz };
        }
    );

    app.post<{ Body: CreateQuizBody }>(
        "/quizzes",
        {
            schema: {
                tags: ["quizzes"],
                summary: "Create a new quiz",
                security: [{ bearerAuth: [] }],
                body: createQuizBodySchema,
                response: {
                    201: quizSchema,
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const quiz = await createQuiz(request.body, request.user.sub);
            return reply.status(201).send(quiz);
        }
    );

    app.put<{ Params: UpdateQuizParams; Body: UpdateQuizBody }>(
        "/quizzes/:id",
        {
            schema: {
                tags: ["quizzes"],
                summary: "Update a quiz",
                security: [{ bearerAuth: [] }],
                params: updateQuizParamsSchema,
                body: updateQuizBodySchema,
                response: {
                    204: z.null(),
                    404: z.object({ message: z.string() }),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { id } = request.params;
            const { count } = await updateQuiz(
                id,
                request.body,
                request.user.sub
            );

            if (count === 0) {
                return reply.status(404).send({ message: "Quiz not found" });
            }
            return reply.status(204).send();
        }
    );

    app.delete<{ Params: DeleteQuizParams }>(
        "/quizzes/:id",
        {
            schema: {
                tags: ["quizzes"],
                summary: "Delete a quiz",
                security: [{ bearerAuth: [] }],
                params: deleteQuizParamsSchema,
                response: {
                    204: z.null(),
                    404: z.object({ message: z.string() }),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { id } = request.params;
            const { count } = await deleteQuiz(id, request.user.sub);

            if (count === 0) {
                return reply.status(404).send({ message: "Quiz not found" });
            }
            return reply.status(204).send();
        }
    );

    // --- Question Management Routes ---
    app.post<{ Params: CreateQuestionParams; Body: CreateQuestionBody }>(
        "/quizzes/:quizId/questions",
        {
            schema: {
                tags: ["quizzes", "questions"],
                summary: "Add a new question to a quiz",
                security: [{ bearerAuth: [] }],
                params: createQuestionParamsSchema,
                body: createQuestionBodySchema,
                response: {
                    201: questionResponseSchema,
                    404: z.object({ message: z.string() }),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { quizId } = request.params;
            const question = await createQuestion(request.user.sub, quizId, request.body);
            if (!question) {
                return reply.status(404).send({ message: "Quiz not found or not owned by user" });
            }
            return reply.status(201).send({ question });
        }
    );

    app.patch<{ Params: UpdateQuestionParams; Body: UpdateQuestionBody }>(
        "/quizzes/:quizId/questions/:questionId",
        {
            schema: {
                tags: ["quizzes", "questions"],
                summary: "Update a question in a quiz",
                security: [{ bearerAuth: [] }],
                params: updateQuestionParamsSchema,
                body: updateQuestionBodySchema,
                response: {
                    200: questionResponseSchema,
                    404: z.object({ message: z.string() }),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { quizId, questionId } = request.params;
            const question = await updateQuestion(request.user.sub, quizId, questionId, request.body);
            if (!question) {
                return reply.status(404).send({ message: "Quiz or Question not found or not owned by user" });
            }
            return reply.status(200).send({ question });
        }
    );

    app.delete<{ Params: DeleteQuestionParams }>(
        "/quizzes/:quizId/questions/:questionId",
        {
            schema: {
                tags: ["quizzes", "questions"],
                summary: "Delete a question from a quiz",
                security: [{ bearerAuth: [] }],
                params: deleteQuestionParamsSchema,
                response: {
                    204: z.null(),
                    404: z.object({ message: z.string() }),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { quizId, questionId } = request.params;
            const result = await deleteQuestion(request.user.sub, quizId, questionId);
            if (result === null || result.count === 0) {
                return reply.status(404).send({ message: "Quiz or Question not found or not owned by user" });
            }
            return reply.status(204).send();
        }
    );

    // --- Answer Management Routes ---
    app.post<{ Params: CreateAnswerParams; Body: CreateAnswerBody }>(
        "/quizzes/:quizId/questions/:questionId/answers",
        {
            schema: {
                tags: ["quizzes", "questions", "answers"],
                summary: "Add a new answer to a question",
                security: [{ bearerAuth: [] }],
                params: createAnswerParamsSchema,
                body: createAnswerBodySchema,
                response: {
                    201: answerResponseSchema,
                    404: z.object({ message: z.string() }),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { quizId, questionId } = request.params;
            const answer = await createAnswer(request.user.sub, quizId, questionId, request.body);
            if (!answer) {
                return reply.status(404).send({ message: "Quiz or Question not found or not owned by user" });
            }
            return reply.status(201).send({ answer });
        }
    );

    app.patch<{ Params: UpdateAnswerParams; Body: UpdateAnswerBody }>(
        "/quizzes/:quizId/questions/:questionId/answers/:answerId",
        {
            schema: {
                tags: ["quizzes", "questions", "answers"],
                summary: "Update an answer in a question",
                security: [{ bearerAuth: [] }],
                params: updateAnswerParamsSchema,
                body: updateAnswerBodySchema,
                response: {
                    200: answerResponseSchema,
                    404: z.object({ message: z.string() }),
                    400: z.object({ message: z.string() }), // For min answers validation
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { quizId, questionId, answerId } = request.params;
            const answer = await updateAnswer(request.user.sub, quizId, questionId, answerId, request.body);
            if (!answer) {
                return reply.status(404).send({ message: "Quiz, Question or Answer not found or not owned by user" });
            }
            return reply.status(200).send({ answer });
        }
    );

    app.delete<{ Params: DeleteAnswerParams }>(
        "/quizzes/:quizId/questions/:questionId/answers/:answerId",
        {
            schema: {
                tags: ["quizzes", "questions", "answers"],
                summary: "Delete an answer from a question",
                security: [{ bearerAuth: [] }],
                params: deleteAnswerParamsSchema,
                response: {
                    204: z.null(),
                    404: z.object({ message: z.string() }),
                    400: z.object({ message: z.string() }), // For min answers validation
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const { quizId, questionId, answerId } = request.params;
            const result = await deleteAnswer(request.user.sub, quizId, questionId, answerId);

            if (result === null) {
                return reply.status(404).send({ message: "Quiz, Question or Answer not found or not owned by user" });
            }
            if (result.error) {
                return reply.status(400).send({ message: result.error });
            }
            if (result.count === 0) {
                return reply.status(404).send({ message: "Answer not found or not owned by user" });
            }
            return reply.status(204).send();
        }
    );
}
