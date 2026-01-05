import { describe, it, expect } from 'vitest'
import { getUserByEmail, createUser } from '../src/services/userService'
import prismaMock from './client'

describe('User Service', () => {
  describe('getUserByEmail', () => {
    it('should return a user if found', async () => {
      const email = 'test@example.com'
      const user = {
        id: '1',
        email,
        name: 'Test User',
        avatarUrl: 'http://example.com/avatar.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prismaMock.user.findUnique.mockResolvedValue(user)

      const result = await getUserByEmail(email)

      expect(result).toEqual(user)
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      })
    })

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com'
      prismaMock.user.findUnique.mockResolvedValue(null)

      const result = await getUserByEmail(email)

      expect(result).toBeNull()
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      })
    })
  })

  describe('createUser', () => {
    it('should create a new user', async () => {
      const email = 'new@example.com'
      const name = 'New User'
      const avatarUrl = 'http://example.com/new.png'
      const user = {
        id: '2',
        email,
        name,
        avatarUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      prismaMock.user.create.mockResolvedValue(user)

      const result = await createUser(email, name, avatarUrl)

      expect(result).toEqual(user)
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { email, name, avatarUrl },
      })
    })
  })
})
