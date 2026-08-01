export type LLMCredentialsStatus = {
  has_openrouter_api_key: boolean
  has_huggingface_token: boolean
  is_complete: boolean
}

export type SaveLLMCredentialsRequest = {
  openrouter_api_key: string
  huggingface_token: string
}

export type SaveLLMCredentialsResponse = {
  status: "saved"
  credentials: LLMCredentialsStatus
}
