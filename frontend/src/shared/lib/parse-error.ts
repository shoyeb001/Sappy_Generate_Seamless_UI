function extractDetail(value: string): string {
  try {
    const parsed = JSON.parse(value) as { detail?: string }
    return parsed.detail ?? value
  } catch {
    return value
  }
}

/**
 * Normalizes the many error shapes this app encounters into a display string:
 * RTK Query errors ({ data } as string or { detail }), thrown Errors whose
 * message may be a JSON body, and unknown values.
 */
export function parseError(
  error: unknown,
  fallback = "Something went wrong."
): string {
  if (error instanceof Error) {
    return extractDetail(error.message)
  }

  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data: unknown }).data
    if (typeof data === "string") {
      return extractDetail(data)
    }
    if (data && typeof data === "object" && "detail" in data) {
      return String((data as { detail: unknown }).detail)
    }
  }

  return fallback
}
