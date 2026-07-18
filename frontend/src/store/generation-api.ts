import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"

import { generationEventReceived } from "./generation-slice"
import type { GenerationEvent, GenerationEventType } from "./generation-types"

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000"

type StartGenerationArgs = {
  projectId: string
  prompt: string
}

type StartGenerationResult = {
  projectId: string
}

function parseSseMessage(message: string): GenerationEvent | null {
  const lines = message.split("\n")
  let eventType: GenerationEventType | null = null
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventType = line.slice("event:".length).trim() as GenerationEventType
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim())
    }
  }

  if (!eventType || dataLines.length === 0) {
    return null
  }

  return {
    type: eventType,
    data: JSON.parse(dataLines.join("\n")) as GenerationEvent["data"],
  } as GenerationEvent
}

export const generationApi = createApi({
  reducerPath: "generationApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    startGenerationStream: builder.mutation<
      StartGenerationResult,
      StartGenerationArgs
    >({
      queryFn: async ({ projectId, prompt }, api) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/projects/stream`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
            signal: api.signal,
          })

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: await response.text(),
              },
            }
          }

          if (!response.body) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                data: "Streaming response did not include a readable body.",
              },
            }
          }

          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const messages = buffer.split("\n\n")
            buffer = messages.pop() ?? ""

            for (const message of messages) {
              const event = parseSseMessage(message)
              if (!event) {
                continue
              }

              api.dispatch(generationEventReceived({ projectId, event }))
            }
          }

          if (buffer.trim()) {
            const event = parseSseMessage(buffer)
            if (event) {
              api.dispatch(generationEventReceived({ projectId, event }))
            }
          }

          return {
            data: {
              projectId,
            },
          }
        } catch (error) {
          if (api.signal.aborted) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                data: "Generation stream was cancelled.",
              },
            }
          }

          return {
            error: {
              status: "CUSTOM_ERROR",
              data:
                error instanceof Error
                  ? error.message
                  : "Generation stream failed.",
            },
          }
        }
      },
    }),
  }),
})

export const { useStartGenerationStreamMutation } = generationApi
