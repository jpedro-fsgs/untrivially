import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../plugins/authenticate";
import {
    createUser,
    getUserByEmail,
    getUserById,
} from "../services/userService";
import { sessionService } from "../services/sessionService";
import { userSchema } from "../schemas/user";

export async function authRoutes(app: FastifyInstance) {
    app.get(
        "/me",
        {
            schema: {
                tags: ['authentication'],
                summary: 'Get authenticated user details',
                security: [{ bearerAuth: [] }],
                response: {
                    200: z.object({
                        user: userSchema,
                    }),
                    404: z.object({
                        message: z.string(),
                    }),
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const user = await getUserById(request.user.sub);
            if (!user) {
                return reply.status(404).send({ message: "User not found." });
            }
            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                }
            };
        }
    );

    app.post(
        '/auth/refresh',
        {
            schema: {
                tags: ['authentication'],
                summary: 'Refresh access token using rotation and theft detection',
                response: {
                    200: z.object({
                        accessToken: z.string(),
                    }),
                    401: z.object({
                        message: z.string()
                    })
                }
            }
        },
        async (request, reply) => {
            const refreshTokenCookie = request.cookies.untrivially_refresh_token;

            if (!refreshTokenCookie) {
                return reply.status(401).send({ message: 'Refresh token not found.' });
            }

            // Find the token in the database
            const dbToken = await sessionService.findRefreshToken(refreshTokenCookie);

            // If token is not found, it's invalid, expired, or has been used before (theft attempt)
            if (!dbToken) {
                // For extra security, you could clear the cookie to force logout
                reply.clearCookie("untrivially_refresh_token", {
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                });
                return reply.status(401).send({ message: 'Invalid or expired refresh token.' });
            }

            // --- TOKEN ROTATION ---
            // It's a valid token, so we'll use it once and then rotate it.

            // 1. Delete the used token immediately
            await sessionService.deleteRefreshToken(refreshTokenCookie);
            
            // 2. Create a new access token
            const newAccessToken = app.jwt.sign(
                {
                    name: dbToken.user.name,
                    email: dbToken.user.email,
                    avatarUrl: dbToken.user.avatarUrl,
                },
                {
                    sub: dbToken.user.id,
                    expiresIn: "15m",
                }
            );

            // 3. Create a new refresh token
            const newRefreshToken = await sessionService.createRefreshToken(
                dbToken.userId,
                request.headers['user-agent'] || 'unknown',
                request.ip
            );

            // 4. Set the new refresh token in the cookie
            reply.setCookie("untrivially_refresh_token", newRefreshToken, {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            });


            return { accessToken: newAccessToken };
        }
    )

    app.get(
        "/auth/google/callback",
        {
            schema: {
                tags: ['authentication'],
                summary: 'Google OAuth callback handler',
                response: {
                    200: z.object({
                        accessToken: z.string(),
                        user: userSchema
                    })
                }
            },
        },
        async (request, reply) => {
            const { token } =
                await app.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
                    request
                );

            const userResponse = await fetch(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token.access_token}`,
                    },
                }
            );

            const userData = await userResponse.json();

            const userInfoSchema = z.object({
                id: z.string(),
                email: z.email(),
                name: z.string(),
                picture: z.url(),
            });

            const userInfo = userInfoSchema.parse(userData);
            let user = await getUserByEmail(userInfo.email);

            if (!user) {
                user = await createUser(
                    userInfo.email,
                    userInfo.name,
                    userInfo.picture
                );
            }

            const accessToken = app.jwt.sign(
                {
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                },
                {
                    sub: user.id,
                    expiresIn: "15m",
                }
            );

            const refreshToken = await sessionService.createRefreshToken(
                user.id,
                request.headers['user-agent'] || 'unknown',
                request.ip
            );

            reply.setCookie("untrivially_refresh_token", refreshToken, {
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            });

            return {
                accessToken,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl,
                }
            };
        }
    );

    app.post(
        '/auth/logout',
        {
            schema: {
                tags: ['authentication'],
                summary: 'Logout user by clearing refresh token cookie and DB entry',
                response: {
                    204: z.null(),
                },
            },
        },
        async (request, reply) => {
            const refreshTokenCookie = request.cookies.untrivially_refresh_token;

            if (refreshTokenCookie) {
                await sessionService.deleteRefreshToken(refreshTokenCookie);
            }

            reply.clearCookie('untrivially_refresh_token', {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });

            return reply.status(204).send();
        }
    );

    app.get('/auth/sessions', {
        schema: {
            tags: ['authentication'],
            summary: 'Get all active sessions for the current user',
            security: [{ bearerAuth: [] }],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    userAgent: z.string(),
                    ipAddress: z.string(),
                    createdAt: z.string().transform(val => new Date(val).toISOString()),
                    updatedAt: z.string().transform(val => new Date(val).toISOString()),
                    isCurrent: z.boolean(),
                })),
            },
        },
        onRequest: [authenticate],
    }, async (request, reply) => {
        const userId = request.user.sub;
        const currentTokenCookie = request.cookies.untrivially_refresh_token;

        if (!currentTokenCookie) {
            // This case is unlikely if 'authenticate' middleware passed
            return [];
        }

        const currentHashedToken = sessionService.hashToken(currentTokenCookie);
        const sessions = await sessionService.getUserSessions(userId);

        const sessionData = sessions.map(session => {
            const { hashedToken, ...rest } = session;
            return {
                ...rest,
                createdAt: session.createdAt.toISOString(),
                updatedAt: session.updatedAt.toISOString(),
                isCurrent: hashedToken === currentHashedToken,
            };
        });

        return sessionData;
    });
}

