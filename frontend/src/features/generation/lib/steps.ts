import type {
  GenerationEventType,
  GenerationStatus,
} from "~/features/generation/types"

export const statusCopy: Record<GenerationStatus, string> = {
  idle: "Waiting for a prompt...",
  starting: "Starting your design...",
  planning: "Planning your application...",
  designing: "Creating a visual direction...",
  generating: "Composing UI frames...",
  completed: "Designs ready.",
  failed: "Design failed.",
}

export type StepState = "pending" | "active" | "complete" | "failed"

function hasEvent(
  events: GenerationEventType[],
  eventName: GenerationEventType
) {
  return events.includes(eventName)
}

export function getStepState(
  events: GenerationEventType[],
  status: GenerationStatus,
  currentEvent: GenerationEventType,
  nextEvent?: GenerationEventType
): StepState {
  if (status === "failed") {
    return hasEvent(events, currentEvent) ? "complete" : "failed"
  }

  if (hasEvent(events, nextEvent ?? "generation_completed")) {
    return "complete"
  }

  if (hasEvent(events, currentEvent)) {
    return nextEvent ? "active" : "complete"
  }

  return "pending"
}

export type ProjectStep = {
  label: string
  state: StepState
}

/** Builds the ordered step list shown in the project sidebar. */
export function buildSteps(
  events: GenerationEventType[],
  status: GenerationStatus
): ProjectStep[] {
  return [
    {
      label: "Design started",
      state: getStepState(
        events,
        status,
        "generation_started",
        "project_planned"
      ),
    },
    {
      label: "Product mapped",
      state: getStepState(
        events,
        status,
        "project_planned",
        "design_system_completed"
      ),
    },
    {
      label: "Visual system ready",
      state: getStepState(
        events,
        status,
        "design_system_completed",
        "screens_planned"
      ),
    },
    {
      label: "Frames planned",
      state: getStepState(
        events,
        status,
        "screens_planned",
        "screen_completed"
      ),
    },
    {
      label: "Composing frames",
      state:
        status === "generating"
          ? "active"
          : status === "completed"
            ? "complete"
            : "pending",
    },
  ]
}
