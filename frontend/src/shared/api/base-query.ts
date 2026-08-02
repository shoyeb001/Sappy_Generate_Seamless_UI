import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { getValidAccessToken } from "~/features/auth/session"
import { API_V1_URL } from "~/shared/api/config"

/**
 * Base query for endpoints that require authentication. Injects a fresh
 * access token (refreshing it when stale) via getValidAccessToken. Endpoints
 * that must stay anonymous (login/signup) should use `publicBaseQuery`.
 */
export const authedBaseQuery = fetchBaseQuery({
  baseUrl: API_V1_URL,
  prepareHeaders: async (headers) => {
    const token = await getValidAccessToken()
    headers.set("Authorization", `Bearer ${token}`)
    return headers
  },
})

/** Base query for anonymous endpoints (no Authorization header). */
export const publicBaseQuery = fetchBaseQuery({
  baseUrl: API_V1_URL,
})
