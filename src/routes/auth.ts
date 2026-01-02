import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../plugins/authenticate'
import { createUser, getUserByEmail } from '../services/userService'

export async function authRoutes(app: FastifyInstance) {
  app.get(
    '/me',
    {
      onRequest: [authenticate],
    },
    async (request) => {
      return { user: request.user }
    },
  )

  app.get('/auth/google/callback', async (request, reply) => {
    const { token } =
      await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

    const userResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      },
    )

    const userData = await userResponse.json()

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.email(),
      name: z.string(),
      picture: z.url(),
    })

    const userInfo = userInfoSchema.parse(userData)

    let user = await getUserByEmail(userInfo.email)

    if (!user) {
      user = await createUser(userInfo.email, userInfo.name, userInfo.picture)
    }

    const appToken = app.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: '7 days',
      },
    )

    return reply
      .setCookie('untrivially_token', appToken, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })
      .redirect('/') // Redirect to the frontend application
  })
}
