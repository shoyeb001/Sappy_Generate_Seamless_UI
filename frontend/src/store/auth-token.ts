import type { AuthSession, StoredAuthSession } from "./auth-types"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000"

const AUTH_STORAGE_KEY = "aether.auth.session"
const REFRESH_WINDOW_SECONDS = 60

export function getStoredAuthSession(): StoredAuthSession | null {
  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as StoredAuthSession
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
  return getExpiresAt(session) - REFRESH_WINDOW_SECONDS > Math.floor(Date.now() / 1000)
}

export async function refreshAuthSession(
  refreshToken: string,
  signal?: AbortSignal,
): Promise<StoredAuthSession> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
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

  return saveAuthSession((await response.json()) as AuthSession)
}

export async function getValidAccessToken(signal?: AbortSignal) {
  const session = getStoredAuthSession()
  if (!session) {
    throw new Error("Login is required before generating UI.")
  }

  if (isAuthSessionFresh(session)) {
    return session.access_token
  }

  const refreshedSession = await refreshAuthSession(session.refresh_token, signal)
  return refreshedSession.access_token
}
