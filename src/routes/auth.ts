import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authenticate } from '../plugins/authenticate'
import { createUser, getUserByEmail } from '../services/userService'

export async function authRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/me',
    {
      onRequest: [authenticate],
    },
    async (request) => {
      return { user: request.user }
    },
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    async (request, reply) => {
      const createUserBody = z.object({
        access_token: z.string(),
      })

      const { access_token } = createUserBody.parse(request.body)

      const userResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )

      const userData = await userResponse.json()

      const userInfoSchema = z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string(),
        picture: z.string().url(),
      })

      const userInfo = userInfoSchema.parse(userData)

      let user = await getUserByEmail(userInfo.email)

      if (!user) {
        user = await createUser(
          userInfo.email,
          userInfo.name,
          userInfo.picture,
        )
      }

      const token = app.jwt.sign(
        {
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        {
          sub: user.id,
          expiresIn: '7 days',
        },
      )

      return { token }
    },
  )
}
