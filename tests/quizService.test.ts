import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
} from '../src/services/quizService'
import prismaMock from './client'
import * as utils from '../src/lib/utils'

// Mock the utility function for generating short IDs to make tests deterministic
vi.mock('../src/lib/utils', async () => {
  const actual: any = await vi.importActual('../src/lib/utils')
  return {
    ...actual,
    generateShortId: vi.fn(),
  }
})

describe('Quiz Service', () => {
  const userId = 'user-123'
  const quizId = 'quiz-uuid-123'
  const questionId = 'q-uuid-456'
  const answerId = 'a-uuid-789'

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(utils, 'generateShortId').mockRestore()
  })

  // Mock implementation for findQuizAndVerifyOwnership helper
  const mockQuiz = {
    id: quizId,
    subId: 'Q1',
    userId,
    title: 'Test Quiz',
    questions: [
      {
        id: questionId,
        quizId,
        answers: [{ id: 'ans-1' }, { id: 'ans-2' }] as any[],
      },
    ],
  }

  describe('getAllQuizzes', () => {
    it('should return all quizzes for a user including questions and answers', async () => {
      const quizzes = [
        {
          id: quizId,
          title: 'Quiz 1',
          userId,
          questions: [],
          subId: 'q1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      prismaMock.quiz.findMany.mockResolvedValue(quizzes)

      const result = await getAllQuizzes(userId)

      expect(result).toEqual(quizzes)
      expect(prismaMock.quiz.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { questions: { include: { answers: true } } },
      })
    })
  })

  describe('getQuizById', () => {
    it('should return a quiz including questions and answers if found', async () => {
      const quiz = {
        id: quizId,
        title: 'Quiz 1',
        userId,
        questions: [],
        subId: 'q1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prismaMock.quiz.findUnique.mockResolvedValue(quiz)

      const result = await getQuizById(quizId)

      expect(result).toEqual(quiz)
      expect(prismaMock.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: quizId },
        include: { questions: { include: { answers: true } } },
      })
    })
  })

  describe('createQuiz', () => {
    it('should create a new quiz with relational questions and answers', async () => {
      const createQuizBody = {
        title: 'New Relational Quiz',
        questions: [
          {
            title: 'Q1',
            options: [{ text: 'A1' }, { text: 'A2' }],
            correctOptionIndex: 0,
          },
        ],
      }

      // Mock generateShortId calls
      const shortIdMock = vi.spyOn(utils, 'generateShortId')
      shortIdMock.mockReturnValueOnce('quizSubId') // For the quiz subId
      shortIdMock.mockReturnValueOnce('q1SubId')   // For the first question
      shortIdMock.mockReturnValueOnce('a1SubId')   // For the first answer
      shortIdMock.mockReturnValueOnce('a2SubId')   // For the second answer

      const createdQuiz = {
        id: 'new-quiz-id',
        userId,
        title: 'New Relational Quiz',
        subId: 'quizSubId',
        questions: [
          {
            id: 'quizSubId-q1SubId',
            title: 'Q1',
            answers: [
              { id: 'quizSubId-q1SubId-a1SubId', text: 'A1', isCorrect: true },
              { id: 'quizSubId-q1SubId-a2SubId', text: 'A2', isCorrect: false },
            ],
          },
        ],
      }

      prismaMock.quiz.create.mockResolvedValue(createdQuiz as any)

      const result = await createQuiz(createQuizBody, userId)

      expect(result).toEqual(createdQuiz)
      expect(prismaMock.quiz.create).toHaveBeenCalledWith({
        data: {
          subId: 'quizSubId',
          title: 'New Relational Quiz',
          userId: 'user-123',
          questions: {
            create: [
              {
                id: 'quizSubId-q1SubId',
                imageUrl: undefined,
                title: 'Q1',
                answers: {
                  create: [
                    {
                      id: 'quizSubId-q1SubId-a1SubId',
                      imageUrl: undefined,
                      isCorrect: true,
                      text: 'A1',
                    },
                    {
                      id: 'quizSubId-q1SubId-a2SubId',
                      imageUrl: undefined,
                      isCorrect: false,
                      text: 'A2',
                    },
                  ],
                },
              },
            ],
          },
        },
        include: {
          questions: {
            include: {
              answers: true,
            },
          },
        },
      })
    })
  })

  // Tests for update and delete remain largely the same as they don't involve deep nesting logic.
  describe('updateQuiz', () => {
    it('should update a quiz for the owning user', async () => {
      const updateData = { title: 'Updated Title' }
      prismaMock.quiz.updateMany.mockResolvedValue({ count: 1 })

      const result = await updateQuiz(quizId, updateData, userId)

      expect(result).toEqual({ count: 1 })
      expect(prismaMock.quiz.updateMany).toHaveBeenCalledWith({
        where: { id: quizId, userId },
        data: updateData,
      })
    })
  })

  describe('deleteQuiz', () => {
    it('should delete a quiz for the owning user', async () => {
      prismaMock.quiz.deleteMany.mockResolvedValue({ count: 1 })
      const result = await deleteQuiz(quizId, userId)
      expect(result).toEqual({ count: 1 })
      expect(prismaMock.quiz.deleteMany).toHaveBeenCalledWith({
        where: { id: quizId, userId },
      })
    })
  })

  // --- New tests for granular services ---

  describe('createQuestion', () => {
    it('should create a question if user owns the quiz', async () => {
      vi.spyOn(utils, 'generateShortId').mockReturnValue('new-q-id')
      prismaMock.quiz.findUnique.mockResolvedValue(mockQuiz as any)
      prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock))
      prismaMock.question.create.mockResolvedValue({ id: 'Q1-new-q-id' } as any)

      const questionData = {
        title: 'New Question',
        answers: [
          { text: 'Ans 1', isCorrect: true },
          { text: 'Ans 2', isCorrect: false },
        ],
      }
      await createQuestion(userId, quizId, questionData)

      expect(prismaMock.question.create).toHaveBeenCalled()
      expect(prismaMock.question.create.mock.calls[0][0].data.title).toBe(
        'New Question'
      )
    })

    it('should return null if user does not own the quiz', async () => {
      prismaMock.quiz.findUnique.mockResolvedValue(null)
      const questionData = { title: 'New Question', answers: [] }
      const result = await createQuestion(userId, 'other-quiz', questionData)
      expect(result).toBeNull()
    })
  })

  describe('updateQuestion', () => {
    it('should update a question if user owns the quiz', async () => {
      prismaMock.quiz.findUnique.mockResolvedValue(mockQuiz as any)
      prismaMock.question.findUnique.mockResolvedValue({ quizId } as any)

      await updateQuestion(userId, quizId, questionId, { title: 'Updated Q' })

      expect(prismaMock.question.update).toHaveBeenCalledWith({
        where: { id: questionId },
        data: { title: 'Updated Q', imageUrl: undefined },
        include: { answers: true },
      })
    })

    it('should return null if user does not own the quiz', async () => {
      prismaMock.quiz.findUnique.mockResolvedValue(null)
      const result = await updateQuestion(userId, 'other-quiz', questionId, {})
      expect(result).toBeNull()
    })
  })

  describe('deleteQuestion', () => {
    it('should delete a question if user owns the quiz', async () => {
      prismaMock.quiz.findUnique.mockResolvedValue(mockQuiz as any)
      prismaMock.question.findUnique.mockResolvedValue({ quizId } as any)
      prismaMock.question.deleteMany.mockResolvedValue({ count: 1 })

      await deleteQuestion(userId, quizId, questionId)

      expect(prismaMock.question.deleteMany).toHaveBeenCalledWith({
        where: { id: questionId, quizId },
      })
    })
  })

  describe('createAnswer', () => {
    it('should create an answer if user owns the quiz', async () => {
      prismaMock.quiz.findUnique.mockResolvedValue(mockQuiz as any)
      prismaMock.question.findUnique.mockResolvedValue(
        mockQuiz.questions[0] as any
      )

      await createAnswer(userId, quizId, questionId, {
        text: 'New Ans',
        isCorrect: false,
      })

      expect(prismaMock.answer.create).toHaveBeenCalled()
    })
  })

  describe('updateAnswer', () => {
    it('should update an answer if user owns the quiz', async () => {
      prismaMock.quiz.findUnique.mockResolvedValue(mockQuiz as any)
      prismaMock.question.findUnique.mockResolvedValue(
        mockQuiz.questions[0] as any
      )
      prismaMock.answer.findUnique.mockResolvedValue({ questionId } as any)

      await updateAnswer(userId, quizId, questionId, answerId, {
        text: 'Updated A',
      })

      expect(prismaMock.answer.update).toHaveBeenCalledWith({
        where: { id: answerId },
        data: { text: 'Updated A', isCorrect: undefined, imageUrl: undefined },
      })
    })
  })

  describe('deleteAnswer', () => {
    it('should delete an answer if user owns the quiz', async () => {
      // Mock question with enough answers to allow deletion
      const questionWithManyAnswers = {
        id: questionId,
        quizId,
        answers: [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }],
      }
      prismaMock.quiz.findUnique.mockResolvedValue({
        ...mockQuiz,
        questions: [questionWithManyAnswers],
      } as any)
      prismaMock.question.findUnique.mockResolvedValue(
        questionWithManyAnswers as any
      )
      prismaMock.answer.findUnique.mockResolvedValue({ questionId } as any)
      prismaMock.answer.deleteMany.mockResolvedValue({ count: 1 })

      await deleteAnswer(userId, quizId, questionId, answerId)

      expect(prismaMock.answer.deleteMany).toHaveBeenCalledWith({
        where: { id: answerId, questionId },
      })
    })

    it('should return an error if trying to delete leaves less than two answers', async () => {
      // Mock question with only two answers
      const questionWithTwoAnswers = {
        id: questionId,
        quizId,
        answers: [{ id: 'a1' }, { id: 'a2' }],
      }
      prismaMock.quiz.findUnique.mockResolvedValue({
        ...mockQuiz,
        questions: [questionWithTwoAnswers],
      } as any)
      prismaMock.question.findUnique.mockResolvedValue(
        questionWithTwoAnswers as any
      )

      const result = await deleteAnswer(userId, quizId, questionId, 'a1')
      expect(result).toEqual({
        count: 0,
        error: 'A question must have at least two answers.',
      })
    })
  })
})
