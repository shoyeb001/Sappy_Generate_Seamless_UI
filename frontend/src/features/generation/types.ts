import { z } from "zod"

export const generationStatusSchema = z.enum([
  "idle",
  "starting",
  "planning",
  "designing",
  "generating",
  "completed",
  "failed",
])
export type GenerationStatus = z.infer<typeof generationStatusSchema>

export const projectPlanSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
  target_users: z.array(z.string()),
  device_type: z.enum(["desktop", "mobile", "tablet", "responsive"]),
})
export type ProjectPlan = z.infer<typeof projectPlanSchema>

export const colorSystemSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  surface: z.string(),
  text_primary: z.string(),
  text_secondary: z.string(),
})
export type ColorSystem = z.infer<typeof colorSystemSchema>

export const typographySystemSchema = z.object({
  heading_font: z.string(),
  body_font: z.string(),
  heading_large: z.string(),
  heading_medium: z.string(),
  body: z.string(),
  small: z.string(),
})
export type TypographySystem = z.infer<typeof typographySystemSchema>

export const uiStyleSchema = z.object({
  border_radius: z.string(),
  spacing_scale: z.array(z.string()),
  shadow_style: z.enum(["none", "subtle", "soft", "medium", "dramatic"]),
  visual_direction: z.string(),
})
export type UIStyle = z.infer<typeof uiStyleSchema>

export const designSystemSchema = z.object({
  colors: colorSystemSchema,
  typography: typographySystemSchema,
  ui_style: uiStyleSchema,
})
export type DesignSystem = z.infer<typeof designSystemSchema>

export const screenPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  purpose: z.string(),
})
export type ScreenPlan = z.infer<typeof screenPlanSchema>

export const generatedScreenSchema = z.object({
  id: z.string(),
  name: z.string(),
  html: z.string(),
  width: z.number(),
  height: z.number(),
})
export type GeneratedScreen = z.infer<typeof generatedScreenSchema>

export const screenEditDecisionSchema = z.object({
  summary: z.string(),
  preserve: z.array(z.string()),
  changes: z.array(z.string()),
  risks: z.array(z.string()),
})
export type ScreenEditDecision = z.infer<typeof screenEditDecisionSchema>

export const generationEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("generation_started"),
    data: z.object({ project_id: z.string(), prompt: z.string() }),
  }),
  z.object({
    type: z.literal("project_planned"),
    data: z.object({ project: projectPlanSchema }),
  }),
  z.object({
    type: z.literal("design_system_completed"),
    data: z.object({ design_system: designSystemSchema }),
  }),
  z.object({
    type: z.literal("screens_planned"),
    data: z.object({ screens: z.array(screenPlanSchema) }),
  }),
  z.object({
    type: z.literal("screen_completed"),
    data: z.object({ screen: generatedScreenSchema }),
  }),
  z.object({
    type: z.literal("generation_completed"),
    data: z.object({ project_id: z.string(), screen_count: z.number() }),
  }),
  z.object({
    type: z.literal("generation_failed"),
    data: z.object({ project_id: z.string().optional(), message: z.string() }),
  }),
  z.object({
    type: z.literal("screen_edit_started"),
    data: z.object({
      edit_id: z.string(),
      screen_id: z.string(),
      instruction: z.string(),
    }),
  }),
  z.object({
    type: z.literal("screen_edit_decision_completed"),
    data: z.object({
      edit_id: z.string(),
      screen_id: z.string(),
      decision: screenEditDecisionSchema,
    }),
  }),
  z.object({
    type: z.literal("screen_edit_completed"),
    data: z.object({ edit_id: z.string(), screen: generatedScreenSchema }),
  }),
  z.object({
    type: z.literal("screen_edit_stream_completed"),
    data: z.object({ edit_id: z.string(), screen_id: z.string() }),
  }),
  z.object({
    type: z.literal("screen_edit_failed"),
    data: z.object({
      edit_id: z.string().optional(),
      screen_id: z.string().optional(),
      message: z.string(),
    }),
  }),
])
export type GenerationEvent = z.infer<typeof generationEventSchema>

export const generationEventTypeSchema = z.enum([
  "generation_started",
  "project_planned",
  "design_system_completed",
  "screens_planned",
  "screen_completed",
  "generation_completed",
  "generation_failed",
  "screen_edit_started",
  "screen_edit_decision_completed",
  "screen_edit_completed",
  "screen_edit_stream_completed",
  "screen_edit_failed",
])
export type GenerationEventType = z.infer<typeof generationEventTypeSchema>
