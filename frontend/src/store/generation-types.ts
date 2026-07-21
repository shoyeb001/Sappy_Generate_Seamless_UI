export type GenerationStatus =
  | "idle"
  | "starting"
  | "planning"
  | "designing"
  | "generating"
  | "completed"
  | "failed"

export type ProjectPlan = {
  name: string
  type: string
  description: string
  target_users: string[]
  device_type: "desktop" | "mobile" | "tablet" | "responsive"
}

export type ColorSystem = {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text_primary: string
  text_secondary: string
}

export type TypographySystem = {
  heading_font: string
  body_font: string
  heading_large: string
  heading_medium: string
  body: string
  small: string
}

export type UIStyle = {
  border_radius: string
  spacing_scale: string[]
  shadow_style: "none" | "subtle" | "soft" | "medium" | "dramatic"
  visual_direction: string
}

export type DesignSystem = {
  colors: ColorSystem
  typography: TypographySystem
  ui_style: UIStyle
}

export type ScreenPlan = {
  id: string
  name: string
  description: string
  purpose: string
}

export type GeneratedScreen = {
  id: string
  name: string
  html: string
  width: number
  height: number
}

export type GenerationEventType =
  | "generation_started"
  | "project_planned"
  | "design_system_completed"
  | "screens_planned"
  | "screen_completed"
  | "generation_completed"
  | "generation_failed"
  | "screen_edit_started"
  | "screen_edit_decision_completed"
  | "screen_edit_completed"
  | "screen_edit_stream_completed"
  | "screen_edit_failed"

export type ScreenEditDecision = {
  summary: string
  preserve: string[]
  changes: string[]
  risks: string[]
}

export type GenerationEvent =
  | {
      type: "generation_started"
      data: {
        project_id: string
        prompt: string
      }
    }
  | {
      type: "project_planned"
      data: {
        project: ProjectPlan
      }
    }
  | {
      type: "design_system_completed"
      data: {
        design_system: DesignSystem
      }
    }
  | {
      type: "screens_planned"
      data: {
        screens: ScreenPlan[]
      }
    }
  | {
      type: "screen_completed"
      data: {
        screen: GeneratedScreen
      }
    }
  | {
      type: "generation_completed"
      data: {
        project_id: string
        screen_count: number
      }
    }
  | {
      type: "generation_failed"
      data: {
        project_id?: string
        message: string
      }
    }
  | {
      type: "screen_edit_started"
      data: {
        edit_id: string
        screen_id: string
        instruction: string
      }
    }
  | {
      type: "screen_edit_decision_completed"
      data: {
        edit_id: string
        screen_id: string
        decision: ScreenEditDecision
      }
    }
  | {
      type: "screen_edit_completed"
      data: {
        edit_id: string
        screen: GeneratedScreen
      }
    }
  | {
      type: "screen_edit_stream_completed"
      data: {
        edit_id: string
        screen_id: string
      }
    }
  | {
      type: "screen_edit_failed"
      data: {
        edit_id?: string
        screen_id?: string
        message: string
      }
    }
