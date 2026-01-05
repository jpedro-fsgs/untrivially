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
    it('should update a quiz', async () => {
      const updateData = { title: 'Updated Title' }
      const updatedQuiz = { id: '1', title: 'Updated Title', userId, questions: [], subId: 'q1', createdAt: new Date(), updatedAt: new Date() }
      prismaMock.quiz.update.mockResolvedValue(updatedQuiz)

      const result = await updateQuiz('1', updateData)

      expect(result).toEqual(updatedQuiz)
      expect(prismaMock.quiz.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData,
      })
    })
  })

  describe('deleteQuiz', () => {
    it('should delete a quiz', async () => {
      const deletedQuiz = { id: '1', title: 'Deleted Quiz', userId, questions: [], subId: 'q1', createdAt: new Date(), updatedAt: new Date() }
      prismaMock.quiz.delete.mockResolvedValue(deletedQuiz)

      const result = await deleteQuiz('1')

      expect(result).toEqual(deletedQuiz)
      expect(prismaMock.quiz.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      })
    })
  })
})
