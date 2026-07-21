import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type {
  DesignSystem,
  GeneratedScreen,
  GenerationEvent,
  GenerationEventType,
  GenerationStatus,
  ProjectPlan,
  ScreenEditDecision,
  ScreenPlan,
} from "./generation-types"

type ScreenEditState = {
  status: "idle" | "understanding" | "regenerating" | "completed" | "failed"
  screenId: string | null
  instruction: string
  decision: ScreenEditDecision | null
  error: string | null
}

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
  edit: ScreenEditState
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
    if (!existing.edit) {
      existing.edit = {
        status: "idle",
        screenId: null,
        instruction: "",
        decision: null,
        error: null,
      }
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
    edit: {
      status: "idle",
      screenId: null,
      instruction: "",
      decision: null,
      error: null,
    },
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
      project.edit = {
        status: "idle",
        screenId: null,
        instruction: "",
        decision: null,
        error: null,
      }
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
        case "screen_edit_started":
          project.edit = {
            status: "understanding",
            screenId: event.data.screen_id,
            instruction: event.data.instruction,
            decision: null,
            error: null,
          }
          break
        case "screen_edit_decision_completed":
          project.edit.status = "regenerating"
          project.edit.screenId = event.data.screen_id
          project.edit.decision = event.data.decision
          project.edit.error = null
          break
        case "screen_edit_completed": {
          project.edit.status = "completed"
          project.edit.screenId = event.data.screen.id
          project.edit.error = null
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
        case "screen_edit_stream_completed":
          if (project.edit.status !== "failed") {
            project.edit.status = "completed"
            project.edit.screenId = event.data.screen_id
          }
          break
        case "screen_edit_failed":
          project.edit.status = "failed"
          project.edit.screenId = event.data.screen_id ?? project.edit.screenId
          project.edit.error = event.data.message
          break
      }
    },
  },
})

export const { generationEventReceived, startProject } = generationSlice.actions
export const generationReducer = generationSlice.reducer
