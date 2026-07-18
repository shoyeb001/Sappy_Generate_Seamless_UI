import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type {
  DesignSystem,
  GeneratedScreen,
  GenerationEvent,
  GenerationEventType,
  GenerationStatus,
  ProjectPlan,
  ScreenPlan,
} from "./generation-types"

export type ProjectGenerationState = {
  id: string
  backendProjectId?: string
  prompt: string
  status: GenerationStatus
  project: ProjectPlan | null
  designSystem: DesignSystem | null
  screens: ScreenPlan[]
  generatedScreens: GeneratedScreen[]
  error: string | null
  events: GenerationEventType[]
}

type GenerationState = {
  activeProjectId: string | null
  projects: Record<string, ProjectGenerationState>
}

const initialState: GenerationState = {
  activeProjectId: null,
  projects: {},
}

function ensureProject(
  state: GenerationState,
  projectId: string,
  prompt = "",
): ProjectGenerationState {
  const existing = state.projects[projectId]
  if (existing) {
    if (prompt && !existing.prompt) {
      existing.prompt = prompt
    }
    return existing
  }

  const project: ProjectGenerationState = {
    id: projectId,
    prompt,
    status: "idle",
    project: null,
    designSystem: null,
    screens: [],
    generatedScreens: [],
    error: null,
    events: [],
  }
  state.projects[projectId] = project
  return project
}

const generationSlice = createSlice({
  name: "generation",
  initialState,
  reducers: {
    startProject: (
      state,
      action: PayloadAction<{
        projectId: string
        prompt: string
      }>,
    ) => {
      const project = ensureProject(
        state,
        action.payload.projectId,
        action.payload.prompt,
      )
      project.status = "starting"
      project.prompt = action.payload.prompt
      project.error = null
      project.events = []
      project.project = null
      project.designSystem = null
      project.screens = []
      project.generatedScreens = []
      state.activeProjectId = action.payload.projectId
    },
    generationEventReceived: (
      state,
      action: PayloadAction<{
        projectId: string
        event: GenerationEvent
      }>,
    ) => {
      const project = ensureProject(state, action.payload.projectId)
      const event = action.payload.event
      project.events.push(event.type)

      switch (event.type) {
        case "generation_started":
          project.status = "planning"
          project.backendProjectId = event.data.project_id
          project.prompt = event.data.prompt
          project.error = null
          break
        case "project_planned":
          project.status = "designing"
          project.project = event.data.project
          break
        case "design_system_completed":
          project.status = "generating"
          project.designSystem = event.data.design_system
          break
        case "screens_planned":
          project.status = "generating"
          project.screens = event.data.screens
          break
        case "screen_completed": {
          project.status = "generating"
          const screen = event.data.screen
          const existingIndex = project.generatedScreens.findIndex(
            (item) => item.id === screen.id,
          )
          if (existingIndex >= 0) {
            project.generatedScreens[existingIndex] = screen
          } else {
            project.generatedScreens.push(screen)
          }
          break
        }
        case "generation_completed":
          project.status = "completed"
          project.backendProjectId = event.data.project_id
          break
        case "generation_failed":
          project.status = "failed"
          project.backendProjectId = event.data.project_id
          project.error = event.data.message
          break
      }
    },
  },
})

export const { generationEventReceived, startProject } = generationSlice.actions
export const generationReducer = generationSlice.reducer
