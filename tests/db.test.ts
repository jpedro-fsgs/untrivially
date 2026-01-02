import { prisma } from '../src/lib/prisma'
import { describe, it, expect } from 'vitest'

describe('Database Connection', () => {
  it('should connect to the database and perform a simple query', async () => {
    try {
      const result = await prisma.$queryRaw`SELECT 1`
      expect(result).toBeDefined()
    } catch (error) {
      // If the query fails, the test will fail.
      expect(error).toBeUndefined()
    }
  })
})
