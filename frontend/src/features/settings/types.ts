import { z } from "zod"

export const llmCredentialsStatusSchema = z.object({
  has_openrouter_api_key: z.boolean(),
  has_huggingface_token: z.boolean(),
  is_complete: z.boolean(),
})

export const saveLLMCredentialsResponseSchema = z.object({
  status: z.literal("saved"),
  credentials: llmCredentialsStatusSchema,
})

export type LLMCredentialsStatus = z.infer<typeof llmCredentialsStatusSchema>
export type SaveLLMCredentialsResponse = z.infer<
  typeof saveLLMCredentialsResponseSchema
>

export const saveLLMCredentialsSchema = z.object({
  openrouter_api_key: z.string().min(10, "Enter a valid OpenRouter API key"),
  huggingface_token: z.string().min(10, "Enter a valid Hugging Face token"),
})

export type SaveLLMCredentialsRequest = z.infer<typeof saveLLMCredentialsSchema>
