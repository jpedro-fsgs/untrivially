import fastify from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
} from "fastify-type-provider-zod";
import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyJwt } from "@fastify/jwt";
import { fastifyCookie } from "@fastify/cookie";
import oauthPlugin from "@fastify/oauth2";

import { authRoutes } from "./routes/auth";
import { quizRoutes } from "./routes/quiz";

// Determine environment
export const isDev = process.env.NODE_ENV === "development";
// Instantiate Fastify with proper logging configuration on development and production
const app = fastify({
    logger: isDev
        ? {
              transport: {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                      translateTime: true,
                  },
              },
              level: "debug",
          }
        : {
              level: "info",
          },
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
    origin: "*",
});

app.register(fastifySwagger, {
    swagger: {
        info: {
            title: "Untrivially",
            description:
                "An interactive quiz application that allows users to create, manage, and take quizzes.",
            version: "1.0.0",
        },
        consumes: ["application/json"],
        produces: ["application/json"],
    },
});

app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
});

app.register(fastifyJwt, {
    secret: "untrivially",
    cookie: {
        cookieName: "untrivially_token",
        signed: false, // Disabling signing for simplicity, can be enabled in production
    },
});

app.register(fastifyCookie);

app.register(oauthPlugin, {
    name: "googleOAuth2",
    scope: ["profile", "email"],
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID!,
            secret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/login/google",
    callbackUri: "http://localhost:3333/auth/google/callback",
    cookie: {
        secure: true,
        sameSite: 'none'
    }
});

app.register(authRoutes);
app.register(quizRoutes);

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
    app.log.info(`This was a triumph.`);
    app.log.info(`I'm making a note here: HUGE SUCCESS.`);
    app.log.info(`It's hard to overstate my satisfaction.`);
});


