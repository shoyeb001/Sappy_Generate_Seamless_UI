import { Badge } from "@/components/ui/badge"
import { useStartGenerationStreamMutation } from "@/store/generation-api"
import type { GenerationStatus } from "@/store/generation-types"
import { useAppSelector } from "@/store/store"
import {
  CheckCircle2,
  Circle,
  Loader2,
  Monitor,
  Sparkles,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { Link, useParams } from "react-router"
import { ScreenFlowCanvas } from "./components/screen-flow-canvas"

const statusCopy: Record<GenerationStatus, string> = {
  idle: "Waiting for a prompt...",
  starting: "Starting your design...",
  planning: "Planning your application...",
  designing: "Creating a visual direction...",
  generating: "Composing UI frames...",
  completed: "Designs ready.",
  failed: "Design failed.",
}

type StepState = "pending" | "active" | "complete" | "failed"

function StepIcon({ state }: { state: StepState }) {
  if (state === "complete") {
    return <CheckCircle2 className="size-5 text-emerald-400" />
  }

  if (state === "failed") {
    return <XCircle className="size-5 text-red-400" />
  }

  if (state === "active") {
    return <Loader2 className="size-5 animate-spin text-cyan-300" />
  }

  return <Circle className="size-5 text-slate-600" />
}

function hasEvent(events: string[], eventName: string) {
  return events.includes(eventName)
}

function getStepState(
  events: string[],
  status: GenerationStatus,
  currentEvent: string,
  nextEvent?: string,
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

export default function ProjectPage() {
  const { projectId } = useParams()
  const startedRef = useRef(false)
  const [startGeneration, streamState] = useStartGenerationStreamMutation()

  const project = useAppSelector((state) =>
    projectId ? state.generation.projects[projectId] : undefined,
  )

  useEffect(() => {
    if (!projectId || !project?.prompt || startedRef.current) {
      return
    }

    startedRef.current = true
    void startGeneration({
      projectId,
      prompt: project.prompt,
    })
  }, [project?.prompt, projectId, startGeneration])

  const steps = useMemo(() => {
    const events = project?.events ?? []
    const status = project?.status ?? "idle"

    return [
      {
        label: "Design started",
        state: getStepState(events, status, "generation_started", "project_planned"),
      },
      {
        label: "Product mapped",
        state: getStepState(
          events,
          status,
          "project_planned",
          "design_system_completed",
        ),
      },
      {
        label: "Visual system ready",
        state: getStepState(
          events,
          status,
          "design_system_completed",
          "screens_planned",
        ),
      },
      {
        label: "Frames planned",
        state: getStepState(events, status, "screens_planned", "screen_completed"),
      },
      {
        label: "Composing frames",
        state:
          project?.status === "generating"
            ? "active"
            : project?.status === "completed"
              ? "complete"
              : "pending",
      },
    ] satisfies Array<{ label: string; state: StepState }>
  }, [project?.events, project?.status])

  if (!projectId || !project) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <Badge className="mb-5">No active prompt</Badge>
        <h1 className="text-4xl font-bold text-white">Start from the landing page</h1>
        <p className="mt-4 text-slate-400">
          This project route needs a prompt from the generator form.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Create a UI
        </Link>
      </section>
    )
  }

  return (
    <section className="min-h-screen px-4 py-10 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Design status</p>
              <h1 className="font-semibold text-white">{statusCopy[project.status]}</h1>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Prompt</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{project.prompt}</p>
          </div>

          <div className="mt-6 space-y-4">
            {steps.map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <StepIcon state={step.state} />
                <span className="text-sm text-slate-300">{step.label}</span>
              </div>
            ))}
          </div>

          {project.project ? (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Project</p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                {project.project.name}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{project.project.type}</p>
            </div>
          ) : null}

          {project.error || streamState.error ? (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {project.error ?? "Unable to connect to the generation stream."}
            </div>
          ) : null}
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">UI frames</p>
              <h2 className="text-2xl font-semibold text-white">
                {project.generatedScreens.length} of {project.screens.length || "..."} ready
              </h2>
            </div>
            <Badge className="gap-1">
              <Monitor className="size-3" />
              Design stream
            </Badge>
          </div>

          <ScreenFlowCanvas
            screens={project.screens}
            generatedScreens={project.generatedScreens}
          />
        </div>
      </div>
    </section>
  )
}
