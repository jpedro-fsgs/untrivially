import { z } from "zod";

export const userSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    avatarUrl: z.url().nullable(),
});

export type User = z.infer<typeof userSchema>;
