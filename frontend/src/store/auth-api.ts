import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

import { authSessionReceived } from "./auth-slice"
import { API_BASE_URL } from "./auth-token"
import type { AuthCredentials, AuthSession } from "./auth-types"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, AuthCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(authSessionReceived(data))
        } catch {
          // The form renders the RTK Query error state.
        }
      },
    }),
    signup: builder.mutation<AuthSession, AuthCredentials>({
      query: (credentials) => ({
        url: "/auth/signup",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(authSessionReceived(data))
        } catch {
          // The form renders the RTK Query error state.
        }
      },
    }),
  }),
})

export const { useLoginMutation, useSignupMutation } = authApi
