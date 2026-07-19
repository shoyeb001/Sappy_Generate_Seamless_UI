export type AuthUser = {
  id: string
  email: string | null
}

export type AuthSession = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  expires_at: number | null
  user: AuthUser
}

export type StoredAuthSession = AuthSession & {
  saved_at: number
}

export type AuthCredentials = {
  email: string
  password: string
}
