import { z } from 'zod'

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.date(),
})

export type User = z.infer<typeof userSchema>
