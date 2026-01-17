import { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../plugins/authenticate";
import {
    createUser,
    getUserByEmail,
    getUserById,
    updateUserRefreshToken,
} from "../services/userService";
import { userSchema } from "../schemas/user";

export async function authRoutes(app: FastifyInstance) {
    app.get(
        "/me",
        {
            schema: {
                tags: ['authentication'],
                summary: 'Get authenticated user details',
                security: [{ bearerAuth: [] }], // Changed from cookieAuth
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
            // Explicitly map to avoid leaking sensitive data like refreshToken
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
                summary: 'Refresh access token',
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
            try {
                const refreshTokenCookie = request.cookies.untrivially_refresh_token;
                if (!refreshTokenCookie) {
                    return reply.status(401).send({ message: 'Refresh token not found.' });
                }

                const decoded = app.jwt.verify<{ sub: string }>(refreshTokenCookie);
                const user = await getUserById(decoded.sub);

                if (!user || user.refreshToken !== refreshTokenCookie) {
                    return reply.status(401).send({ message: 'Invalid refresh token.' });
                }

                const newAccessToken = app.jwt.sign(
                    {
                        name: user.name,
                        email: user.email,
                        avatarUrl: user.avatarUrl,
                    },
                    {
                        sub: user.id,
                        expiresIn: "15m", // Short-lived access token
                    }
                );

                return { accessToken: newAccessToken };

            } catch (err) {
                return reply.status(401).send({ message: 'Invalid or expired refresh token.' });
            }
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
                    expiresIn: "15m", // Short-lived access token
                }
            );

            const refreshToken = app.jwt.sign({}, {
                sub: user.id,
                expiresIn: "30d" // Long-lived refresh token
            });

            await updateUserRefreshToken(user.id, refreshToken);

            reply
                .setCookie("untrivially_refresh_token", refreshToken, {
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                });

            // Instead of redirecting, return tokens and user info
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
                summary: 'Logout user by clearing refresh token cookie',
                security: [{ bearerAuth: [] }],
                response: {
                    204: z.null(),
                    401: z.object({ message: z.string() })
                },
            },
            onRequest: [authenticate],
        },
        async (request, reply) => {
            const userId = request.user.sub;
            await updateUserRefreshToken(userId, null); // Clear refresh token in DB

            reply.clearCookie('untrivially_refresh_token', {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            });

            return reply.status(204).send();
        }
    );
}
