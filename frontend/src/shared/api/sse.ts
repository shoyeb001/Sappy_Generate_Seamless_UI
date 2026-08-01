import { getValidAccessToken } from "~/features/auth/session"
import { API_V1_URL } from "~/shared/api/config"

export type SseFrame = {
  event: string
  data: string
}

type StreamSseArgs = {
  /** Path relative to the API v1 base, e.g. "/projects/stream". */
  path: string
  body: unknown
  signal: AbortSignal
  /** Called once per parsed SSE frame in order. */
  onFrame: (frame: SseFrame) => void
}

export type StreamSseError = {
  status: number | "CUSTOM_ERROR"
  data: string
}

function parseFrame(message: string): SseFrame | null {
  const lines = message.split("\n")
  let event: string | null = null
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice("event:".length).trim()
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim())
    }
  }

  if (!event || dataLines.length === 0) {
    return null
  }

  return { event, data: dataLines.join("\n") }
}

/**
 * Performs an authenticated POST that returns a server-sent-event stream,
 * invoking `onFrame` for each complete frame. Centralizes the fetch, token
 * injection, ReadableStream reader loop, buffering, and abort handling that
 * was previously duplicated across generation mutations.
 *
 * Returns null on success, or a StreamSseError describing the failure.
 */
export async function streamSse({
  path,
  body,
  signal,
  onFrame,
}: StreamSseArgs): Promise<StreamSseError | null> {
  try {
    const accessToken = await getValidAccessToken(signal)
    const response = await fetch(`${API_V1_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      return { status: response.status, data: await response.text() }
    }

    if (!response.body) {
      return {
        status: "CUSTOM_ERROR",
        data: "Streaming response did not include a readable body.",
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
        const frame = parseFrame(message)
        if (frame) {
          onFrame(frame)
        }
      }
    }

    if (buffer.trim()) {
      const frame = parseFrame(buffer)
      if (frame) {
        onFrame(frame)
      }
    }

    return null
  } catch (error) {
    if (signal.aborted) {
      return { status: "CUSTOM_ERROR", data: "Stream was cancelled." }
    }

    return {
      status: "CUSTOM_ERROR",
      data: error instanceof Error ? error.message : "Stream failed.",
    }
  }
}
