import { prisma } from '../lib/prisma'

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  })
}

export async function getUserById(id: string) {
    return prisma.user.findUnique({
        where: {
            id,
        },
    });
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

export async function updateUserRefreshToken(id: string, refreshToken: string | null) {
    return prisma.user.update({
        where: {
            id,
        },
        data: {
            refreshToken,
        },
    });
}

export async function getUserByRefreshToken(refreshToken: string) {
    return prisma.user.findFirst({
        where: {
            refreshToken,
        },
    });
}
