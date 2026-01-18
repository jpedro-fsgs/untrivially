import { prisma } from '../lib/prisma'
import crypto from 'crypto'

class SessionService {
  public createRefreshToken = async (userId: string, userAgent: string, ipAddress: string) => {
    const refreshToken = crypto.randomBytes(40).toString('hex')
    const hashedToken = this.hashToken(refreshToken)

    await prisma.refreshToken.create({
      data: {
        userId,
        hashedToken,
        userAgent,
        ipAddress,
      },
    })

    return refreshToken
  }

  public findRefreshToken = async (token: string) => {
    const hashedToken = this.hashToken(token)
    return prisma.refreshToken.findUnique({
      where: { hashedToken },
      include: { user: true }
    })
  }

  public deleteRefreshToken = async (token: string) => {
    const hashedToken = this.hashToken(token)
    // Use deleteMany because the token is unique, it will only delete one
    return prisma.refreshToken.deleteMany({
      where: { hashedToken },
    })
  }

  private hashToken = (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
}

export const sessionService = new SessionService()
