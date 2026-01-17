import fastify from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider,
    jsonSchemaTransform,
}
from "fastify-type-provider-zod";
import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifyJwt } from "@fastify/jwt";
import { fastifyCookie } from "@fastify/cookie";
import oauthPlugin from "@fastify/oauth2";

import { authRoutes } from "./routes/auth";
import { quizRoutes } from "./routes/quiz";

if (
    [
        process.env.NODE_ENV,
        process.env.JWT_SECRET,
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
    ].includes(undefined)
) {
    throw new Error("Missing environment variables.");
}

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
            level: "info",
        }
        : {
            level: "info",
        },
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// app.register(fastifyCors, {
//     origin: "http://localhost:3333",
//     credentials: true,
// });

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: "Untrivially",
            description:
                "An interactive quiz application that allows users to create, manage, and take quizzes.",
            version: "1.0.0",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
});

app.register(fastifyCookie);
app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
});

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
        secure: !isDev,
        sameSite: "lax",
        path: "/",
        httpOnly: true,
    },
});

app.register(authRoutes);
app.register(quizRoutes);

app.get("/", async () => {
    return { message: "Welcome to Untrivially API!" };
});

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
    app.log.info(`This was a triumph.`);
    app.log.info(`I'm making a note here:`);
    app.log.info(`HUGE SUCCESS.`);
});