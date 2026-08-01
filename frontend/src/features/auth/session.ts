import {
  type AuthSession,
  authSessionSchema,
  type StoredAuthSession,
  storedAuthSessionSchema,
} from "~/features/auth/types"
import { API_V1_URL } from "~/shared/api/config"

const AUTH_STORAGE_KEY = "aether.auth.session"
const REFRESH_WINDOW_SECONDS = 60

export function getStoredAuthSession(): StoredAuthSession | null {
  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawSession) {
    return null
  }

  try {
    const parsed = storedAuthSessionSchema.safeParse(JSON.parse(rawSession))
    if (!parsed.success) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    return parsed.data
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function saveAuthSession(session: AuthSession): StoredAuthSession {
  const storedSession: StoredAuthSession = {
    ...session,
    saved_at: Math.floor(Date.now() / 1000),
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(storedSession))
  return storedSession
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

function getExpiresAt(session: StoredAuthSession) {
  return session.expires_at ?? session.saved_at + session.expires_in
}

export function isAuthSessionFresh(session: StoredAuthSession) {
  return (
    getExpiresAt(session) - REFRESH_WINDOW_SECONDS >
    Math.floor(Date.now() / 1000)
  )
}

export async function refreshAuthSession(
  refreshToken: string,
  signal?: AbortSignal
): Promise<StoredAuthSession> {
  const response = await fetch(`${API_V1_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
    signal,
  })

  if (!response.ok) {
    clearAuthSession()
    throw new Error(await response.text())
  }

  const parsed = authSessionSchema.safeParse(await response.json())
  if (!parsed.success) {
    clearAuthSession()
    throw new Error("Received a malformed session from the server.")
  }

  return saveAuthSession(parsed.data)
}

export async function getValidAccessToken(signal?: AbortSignal) {
  const session = getStoredAuthSession()
  if (!session) {
    throw new Error("Login is required before generating UI.")
  }

  if (isAuthSessionFresh(session)) {
    return session.access_token
  }

  const refreshedSession = await refreshAuthSession(
    session.refresh_token,
    signal
  )
  return refreshedSession.access_token
}
