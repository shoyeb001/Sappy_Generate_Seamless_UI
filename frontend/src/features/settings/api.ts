import { createApi } from "@reduxjs/toolkit/query/react"
import type {
  LLMCredentialsStatus,
  SaveLLMCredentialsRequest,
  SaveLLMCredentialsResponse,
} from "~/features/settings/types"
import { authedBaseQuery } from "~/shared/api/base-query"

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: authedBaseQuery,
  tagTypes: ["LLMCredentials"],
  endpoints: (builder) => ({
    getLLMCredentialsStatus: builder.query<LLMCredentialsStatus, void>({
      query: () => "/settings/llm-credentials/status",
      providesTags: ["LLMCredentials"],
    }),
    saveLLMCredentials: builder.mutation<
      SaveLLMCredentialsResponse,
      SaveLLMCredentialsRequest
    >({
      query: (credentials) => ({
        url: "/settings/llm-credentials",
        method: "PUT",
        body: credentials,
      }),
      invalidatesTags: ["LLMCredentials"],
    }),
  }),
})

export const {
  useGetLLMCredentialsStatusQuery,
  useSaveLLMCredentialsMutation,
} = settingsApi
