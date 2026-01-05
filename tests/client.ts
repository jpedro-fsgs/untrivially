import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'vitest-mock-extended'

import { beforeEach } from 'vitest'

beforeEach(() => {
  mockReset(prismaMock)
})

const prismaMock = mockDeep<PrismaClient>()
export default prismaMock
