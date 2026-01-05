import { vi } from 'vitest'
import prismaMock from './client'

vi.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
  prisma: prismaMock,
}))
