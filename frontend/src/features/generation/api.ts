import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import { generationEventReceived } from "~/features/generation/slice"
import {
  type DesignSystem,
  type GeneratedScreen,
  type GenerationEvent,
  generationEventSchema,
  type ProjectPlan,
  type ScreenPlan,
} from "~/features/generation/types"
import { streamSse } from "~/shared/api/sse"

type StartGenerationArgs = {
  projectId: string
  prompt: string
}

type StartGenerationResult = {
  projectId: string
}

type StartScreenEditArgs = {
  projectId: string
  instruction: string
  originalPrompt: string
  project: ProjectPlan | null
  designSystem: DesignSystem | null
  screenPlan: ScreenPlan | null
  screen: GeneratedScreen
}

function toGenerationEvent(
  event: string,
  data: string
): GenerationEvent | null {
  try {
    const parsed = generationEventSchema.safeParse({
      type: event,
      data: JSON.parse(data),
    })
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
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
        const error = await streamSse({
          path: "/projects/stream",
          body: { prompt },
          signal: api.signal,
          onFrame: ({ event, data }) => {
            const parsed = toGenerationEvent(event, data)
            if (parsed) {
              api.dispatch(
                generationEventReceived({ projectId, event: parsed })
              )
            }
          },
        })

        return error ? { error } : { data: { projectId } }
      },
    }),
    startScreenEditStream: builder.mutation<
      StartGenerationResult,
      StartScreenEditArgs
    >({
      queryFn: async (
        {
          projectId,
          instruction,
          originalPrompt,
          project,
          designSystem,
          screenPlan,
          screen,
        },
        api
      ) => {
        const error = await streamSse({
          path: "/projects/screens/edit/stream",
          body: {
            instruction,
            original_prompt: originalPrompt,
            project,
            design_system: designSystem,
            screen_plan: screenPlan,
            screen,
          },
          signal: api.signal,
          onFrame: ({ event, data }) => {
            const parsed = toGenerationEvent(event, data)
            if (parsed) {
              api.dispatch(
                generationEventReceived({ projectId, event: parsed })
              )
            }
          },
        })

        return error ? { error } : { data: { projectId } }
      },
    }),
  }),
})

export const {
  useStartGenerationStreamMutation,
  useStartScreenEditStreamMutation,
} = generationApi
