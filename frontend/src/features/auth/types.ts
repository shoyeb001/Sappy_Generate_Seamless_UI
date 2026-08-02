import { z } from "zod"

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
})

export const authSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  expires_at: z.number().nullable(),
  user: authUserSchema,
})

export const storedAuthSessionSchema = authSessionSchema.extend({
  saved_at: z.number(),
})

export type AuthUser = z.infer<typeof authUserSchema>
export type AuthSession = z.infer<typeof authSessionSchema>
export type StoredAuthSession = z.infer<typeof storedAuthSessionSchema>

export const authCredentialsSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type AuthCredentials = z.infer<typeof authCredentialsSchema>
