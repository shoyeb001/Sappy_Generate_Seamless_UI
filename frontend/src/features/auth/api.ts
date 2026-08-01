import { createApi } from "@reduxjs/toolkit/query/react"
import { authSessionReceived } from "~/features/auth/slice"
import {
  type AuthCredentials,
  type AuthSession,
  authSessionSchema,
} from "~/features/auth/types"
import { publicBaseQuery } from "~/shared/api/base-query"

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: publicBaseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<AuthSession, AuthCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      responseSchema: authSessionSchema,
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
      responseSchema: authSessionSchema,
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
