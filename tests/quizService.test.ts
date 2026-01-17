import { describe, it, expect, vi } from 'vitest'
import {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from '../src/services/quizService'
import prismaMock from './client'
import * as utils from '../src/lib/utils'

vi.mock('../src/lib/utils', async () => {
  const actual: any = await vi.importActual('../src/lib/utils')
  return {
    ...actual,
    generateShortId: vi.fn(),
  }
})

describe('Quiz Service', () => {
  const userId = 'user-123'

  describe('getAllQuizzes', () => {
    it('should return all quizzes for a user', async () => {
      const quizzes = [
        { id: '1', title: 'Quiz 1', userId, questions: [], subId: 'q1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', title: 'Quiz 2', userId, questions: [], subId: 'q2', createdAt: new Date(), updatedAt: new Date() },
      ]
      prismaMock.quiz.findMany.mockResolvedValue(quizzes)

      const result = await getAllQuizzes(userId)

      expect(result).toEqual(quizzes)
      expect(prismaMock.quiz.findMany).toHaveBeenCalledWith({
        where: { userId },
      })
    })
  })

  describe('getQuizById', () => {
    it('should return a quiz if found', async () => {
      const quiz = { id: '1', title: 'Quiz 1', userId, questions: [], subId: 'q1', createdAt: new Date(), updatedAt: new Date() }
      prismaMock.quiz.findUnique.mockResolvedValue(quiz)

      const result = await getQuizById('1')

      expect(result).toEqual(quiz)
      expect(prismaMock.quiz.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })

    it('should return null if quiz not found', async () => {
      prismaMock.quiz.findUnique.mockResolvedValue(null)

      const result = await getQuizById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('createQuiz', () => {
    it('should create a new quiz with transformed data', async () => {
      const createQuizBody = {
        title: 'New Quiz',
        questions: [
          {
            title: 'Question 1',
            options: [{ text: 'Option 1' }, { text: 'Option 2' }],
            correctOptionIndex: 0,
          },
        ],
      }

      const shortIdMock = vi.spyOn(utils, 'generateShortId')
      shortIdMock.mockReturnValueOnce('quizId')
      shortIdMock.mockReturnValueOnce('q1')
      shortIdMock.mockReturnValueOnce('opt1')
      shortIdMock.mockReturnValueOnce('opt2')


      const expectedQuizData = {
        userId,
        title: 'New Quiz',
        questions: [
          {
            title: 'Question 1',
            questionId: 'quizId-q1',
            options: [
              { text: 'Option 1', optionId: 'quizId-q1-opt1' },
              { text: 'Option 2', optionId: 'quizId-q1-opt2' },
            ],
            correctOptionId: 'quizId-q1-opt1',
          },
        ],
      }
      
      const createdQuiz = { ...expectedQuizData, id: 'new-quiz-id', subId: 'quizId', createdAt: new Date(), updatedAt: new Date() }

      prismaMock.quiz.create.mockResolvedValue(createdQuiz)

      const result = await createQuiz(createQuizBody, userId)

      expect(result).toEqual(createdQuiz)
      expect(prismaMock.quiz.create).toHaveBeenCalledWith({
        data: expectedQuizData,
      })
    })
  })

  describe('updateQuiz', () => {
    it('should update a quiz for the owning user', async () => {
      const updateData = { title: 'Updated Title' }
      prismaMock.quiz.updateMany.mockResolvedValue({ count: 1 })

      const result = await updateQuiz('1', updateData, userId)

      expect(result).toEqual({ count: 1 })
      expect(prismaMock.quiz.updateMany).toHaveBeenCalledWith({
        where: { id: '1', userId },
        data: updateData,
      })
    })

    it('should not update a quiz if it does not belong to the user', async () => {
      const updateData = { title: 'Updated Title' }
      const anotherUserId = 'user-456'
      prismaMock.quiz.updateMany.mockResolvedValue({ count: 0 })

      const result = await updateQuiz('1', updateData, anotherUserId)

      expect(result).toEqual({ count: 0 })
      expect(prismaMock.quiz.updateMany).toHaveBeenCalledWith({
        where: { id: '1', userId: anotherUserId },
        data: updateData,
      })
    })

    it('should not update a quiz if quiz not found', async () => {
      const updateData = { title: 'Updated Title' }
      prismaMock.quiz.updateMany.mockResolvedValue({ count: 0 })

      const result = await updateQuiz('nonexistent', updateData, userId)

      expect(result).toEqual({ count: 0 })
      expect(prismaMock.quiz.updateMany).toHaveBeenCalledWith({
        where: { id: 'nonexistent', userId },
        data: updateData,
      })
    })
  })

  describe('deleteQuiz', () => {
    it('should delete a quiz for the owning user', async () => {
      prismaMock.quiz.deleteMany.mockResolvedValue({ count: 1 })

      const result = await deleteQuiz('1', userId)

      expect(result).toEqual({ count: 1 })
      expect(prismaMock.quiz.deleteMany).toHaveBeenCalledWith({
        where: { id: '1', userId },
      })
    })

    it('should not delete a quiz if it does not belong to the user', async () => {
      const anotherUserId = 'user-456'
      prismaMock.quiz.deleteMany.mockResolvedValue({ count: 0 })

      const result = await deleteQuiz('1', anotherUserId)

      expect(result).toEqual({ count: 0 })
      expect(prismaMock.quiz.deleteMany).toHaveBeenCalledWith({
        where: { id: '1', userId: anotherUserId },
      })
    })

    it('should not delete a quiz if quiz not found', async () => {
      prismaMock.quiz.deleteMany.mockResolvedValue({ count: 0 })

      const result = await deleteQuiz('nonexistent', userId)

      expect(result).toEqual({ count: 0 })
      expect(prismaMock.quiz.deleteMany).toHaveBeenCalledWith({
        where: { id: 'nonexistent', userId },
        data: undefined, // deleteMany does not take a 'data' argument.
      })
    })
  })
})
