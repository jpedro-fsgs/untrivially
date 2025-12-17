import { prisma } from '../lib/prisma'

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  })
}

export async function createUser(email: string, name: string, avatarUrl: string) {
  return prisma.user.create({
    data: {
      email,
      name,
      avatarUrl,
    },
  })
}
