import { API_BASE_URL, getValidAccessToken } from "./auth-token"

export type LLMCredentialsStatus = {
  has_openrouter_api_key: boolean
  has_huggingface_token: boolean
  is_complete: boolean
}

export type SaveLLMCredentialsRequest = {
  openrouter_api_key: string
  huggingface_token: string
}

export async function getLLMCredentialsStatus(signal?: AbortSignal) {
  const accessToken = await getValidAccessToken(signal)
  const response = await fetch(
    `${API_BASE_URL}/api/v1/settings/llm-credentials/status`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    }
  )

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return (await response.json()) as LLMCredentialsStatus
}

export async function saveLLMCredentials(
  credentials: SaveLLMCredentialsRequest,
  signal?: AbortSignal
) {
  const accessToken = await getValidAccessToken(signal)
  const response = await fetch(
    `${API_BASE_URL}/api/v1/settings/llm-credentials`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      signal,
    }
  )

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return (await response.json()) as {
    status: "saved"
    credentials: LLMCredentialsStatus
  }
}
