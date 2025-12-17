import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastifyJwt } from '@fastify/jwt'

import { authRoutes } from './routes/auth'
import { quizRoutes } from './routes/quiz'

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: '*',
})

app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'Untrivially',
      description:
        'An interactive quiz application that allows users to create, manage, and take quizzes.',
      version: '1.0.0',
    },
    consumes: ['application/json'],
    produces: ['application/json'],
  },
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: 'untrivially',
})

app.register(authRoutes)
app.register(quizRoutes)

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})
