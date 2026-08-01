import { toJpeg, toPng } from "html-to-image"
import {
  CheckCircle2,
  Circle,
  Clipboard,
  Download,
  FileImage,
  Loader2,
  Monitor,
  Sparkles,
  WandSparkles,
  X,
  XCircle,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Badge } from "@/components/ui/badge"
import {
  useStartGenerationStreamMutation,
  useStartScreenEditStreamMutation,
} from "@/store/generation-api"
import type {
  GeneratedScreen,
  GenerationStatus,
} from "@/store/generation-types"
import { getLLMCredentialsStatus } from "@/store/settings-api"
import { useAppSelector } from "@/store/store"
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
  nextEvent?: string
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

function getExportFileName(screen: GeneratedScreen, format: "png" | "jpg") {
  const slug = screen.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  return `${slug || screen.id}.${format}`
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const anchor = document.createElement("a")
  anchor.href = dataUrl
  anchor.download = fileName
  anchor.click()
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function createExportFrame(screen: GeneratedScreen) {
  const frame = document.createElement("iframe")

  frame.style.position = "fixed"
  frame.style.left = "-10000px"
  frame.style.top = "0"
  frame.style.width = `${screen.width}px`
  frame.style.height = `${screen.height}px`
  frame.style.overflow = "hidden"
  frame.style.border = "0"
  frame.setAttribute("aria-hidden", "true")

  document.body.appendChild(frame)
  frame.srcdoc = screen.html

  return frame
}

function waitForExportFrame(
  frame: HTMLIFrameElement,
  screen: GeneratedScreen,
  timeoutMs = 5000
) {
  return new Promise<void>((resolve) => {
    const markReady = () => {
      const frameDocument = frame.contentDocument

      if (frameDocument) {
        frameDocument.documentElement.style.width = `${screen.width}px`
        frameDocument.documentElement.style.minHeight = `${screen.height}px`
        frameDocument.body.style.width = `${screen.width}px`
        frameDocument.body.style.minHeight = `${screen.height}px`
        frameDocument.body.style.margin = "0"
      }

      window.clearTimeout(timeoutId)
      window.setTimeout(resolve, 800)
    }

    const timeoutId = window.setTimeout(markReady, timeoutMs)

    if (frame.contentDocument?.readyState === "complete") {
      markReady()
      return
    }

    frame.addEventListener("load", markReady, { once: true })
  })
}

function getExportRoot(frame: HTMLIFrameElement) {
  const root = frame.contentDocument?.body

  if (!root) {
    throw new Error("Unable to prepare the selected frame for export.")
  }

  return root
}

export default function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const startedRef = useRef(false)
  const [startGeneration, streamState] = useStartGenerationStreamMutation()
  const [startScreenEdit, editStreamState] = useStartScreenEditStreamMutation()
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null)
  const [editInstruction, setEditInstruction] = useState("")
  const [exportStatus, setExportStatus] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const project = useAppSelector((state) =>
    projectId ? state.generation.projects[projectId] : undefined
  )
  const session = useAppSelector((state) => state.auth.session)

  useEffect(() => {
    if (!session) {
      navigate(
        `/auth?next=${encodeURIComponent(projectId ? `/project/${projectId}` : "/")}`
      )
      return
    }

    if (!projectId || !project?.prompt || startedRef.current) {
      return
    }

    const controller = new AbortController()

    const startIfConfigured = async () => {
      const credentialsStatus = await getLLMCredentialsStatus(controller.signal)
      if (!credentialsStatus.is_complete) {
        navigate(
          `/settings?required=1&next=${encodeURIComponent(`/project/${projectId}`)}`
        )
        return
      }

      startedRef.current = true
      await startGeneration({
        projectId,
        prompt: project.prompt,
      })
    }

    void startIfConfigured().catch(() => {
      if (!controller.signal.aborted) {
        navigate(
          `/settings?required=1&next=${encodeURIComponent(`/project/${projectId}`)}`
        )
      }
    })

    return () => controller.abort()
  }, [navigate, project?.prompt, projectId, session, startGeneration])

  const steps = (() => {
    const events = project?.events ?? []
    const status = project?.status ?? "idle"

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
          project?.status === "generating"
            ? "active"
            : project?.status === "completed"
              ? "complete"
              : "pending",
      },
    ] satisfies Array<{ label: string; state: StepState }>
  })()

  const selectedScreen =
    project?.generatedScreens.find(
      (screen) => screen.id === selectedScreenId
    ) ?? null

  const selectedScreenPlan =
    project?.screens.find((screen) => screen.id === selectedScreenId) ?? null

  const handleSelectScreen = (screenId: string | null) => {
    setSelectedScreenId(screenId)
    setExportError(null)
    setExportStatus(null)
  }

  const handleClearSelectedScreen = () => {
    setSelectedScreenId(null)
    setExportError(null)
    setExportStatus(null)
  }

  const handleEditSelectedScreen = async () => {
    if (!projectId || !project || !selectedScreen || !editInstruction.trim()) {
      return
    }

    await startScreenEdit({
      projectId,
      instruction: editInstruction.trim(),
      originalPrompt: project.prompt,
      project: project.project,
      designSystem: project.designSystem,
      screenPlan: selectedScreenPlan,
      screen: selectedScreen,
    })
  }

  const handleCopyHtml = async () => {
    if (!selectedScreen) {
      return
    }

    setExportError(null)

    try {
      await navigator.clipboard.writeText(selectedScreen.html)
      setExportStatus("HTML copied")
    } catch {
      const textArea = document.createElement("textarea")
      textArea.value = selectedScreen.html
      textArea.style.position = "fixed"
      textArea.style.left = "-9999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      textArea.remove()
      setExportStatus("HTML copied")
    }
  }

  const handleExportImage = async (format: "png" | "jpg") => {
    if (!selectedScreen) {
      return
    }

    setExportError(null)
    setExportStatus(`Exporting ${format.toUpperCase()}...`)

    const frame = createExportFrame(selectedScreen)

    try {
      await waitForExportFrame(frame, selectedScreen)
      await wait(1200)
      const root = getExportRoot(frame)

      const options = {
        backgroundColor: "#ffffff",
        cacheBust: true,
        canvasHeight: selectedScreen.height,
        canvasWidth: selectedScreen.width,
        height: selectedScreen.height,
        pixelRatio: 1,
        skipFonts: true,
        width: selectedScreen.width,
      }

      const dataUrl =
        format === "png"
          ? await toPng(root, options)
          : await toJpeg(root, {
              ...options,
              quality: 0.95,
            })

      downloadDataUrl(dataUrl, getExportFileName(selectedScreen, format))
      setExportStatus(`${format.toUpperCase()} exported`)
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "Unable to export the selected frame."
      )
      setExportStatus(null)
    } finally {
      frame.remove()
    }
  }

  if (!projectId || !project) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <Badge className="mb-5">No active prompt</Badge>
        <h1 className="font-bold text-4xl text-white">
          Start from the landing page
        </h1>
        <p className="mt-4 text-slate-400">
          This project route needs a prompt from the generator form.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/80"
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
              <p className="text-slate-400 text-sm">Design status</p>
              <h1 className="font-semibold text-white">
                {statusCopy[project.status]}
              </h1>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-slate-500 text-xs uppercase tracking-widest">
              Prompt
            </p>
            <p className="mt-2 text-slate-300 text-sm leading-6">
              {project.prompt}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {steps.map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <StepIcon state={step.state} />
                <span className="text-slate-300 text-sm">{step.label}</span>
              </div>
            ))}
          </div>

          {project.project ? (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-slate-500 text-xs uppercase tracking-widest">
                Project
              </p>
              <h2 className="mt-2 font-semibold text-lg text-white">
                {project.project.name}
              </h2>
              <p className="mt-1 text-slate-400 text-sm">
                {project.project.type}
              </p>
            </div>
          ) : null}

          {project.error || streamState.error ? (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
              {project.error ?? "Unable to connect to the generation stream."}
            </div>
          ) : null}

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-slate-500 text-xs uppercase tracking-widest">
                Edit frame
              </p>
              {project.edit.status === "understanding" ||
              project.edit.status === "regenerating" ? (
                <Loader2 className="size-4 animate-spin text-cyan-300" />
              ) : null}
            </div>

            <div className="mt-3 min-h-8">
              {selectedScreen ? (
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 font-medium text-cyan-100 text-xs">
                  <span className="truncate">{selectedScreen.name}</span>
                  <button
                    type="button"
                    onClick={handleClearSelectedScreen}
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-cyan-100 transition hover:bg-cyan-300/20"
                    aria-label="Remove selected frame"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ) : (
                <p className="text-slate-400 text-sm leading-6">
                  Select one completed frame to edit it.
                </p>
              )}
            </div>

            <textarea
              value={editInstruction}
              onChange={(event) => setEditInstruction(event.target.value)}
              placeholder="Describe the change for the selected frame..."
              className="mt-4 min-h-28 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 text-sm leading-6 outline-none transition placeholder:text-slate-600 focus:border-cyan-300"
            />

            <button
              type="button"
              onClick={() => void handleEditSelectedScreen()}
              disabled={
                !selectedScreen ||
                !editInstruction.trim() ||
                project.edit.status === "understanding" ||
                project.edit.status === "regenerating" ||
                editStreamState.isLoading
              }
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-3 font-semibold text-slate-950 text-sm transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {project.edit.status === "understanding" ||
              project.edit.status === "regenerating" ||
              editStreamState.isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <WandSparkles className="size-4" />
              )}
              Apply edit
            </button>

            {project.edit.status !== "idle" ? (
              <p className="mt-3 text-slate-400 text-sm">
                {project.edit.status === "understanding"
                  ? "Understanding the edit..."
                  : project.edit.status === "regenerating"
                    ? "Regenerating the selected frame..."
                    : project.edit.status === "completed"
                      ? "Selected frame updated."
                      : "Edit failed."}
              </p>
            ) : null}

            {project.edit.decision ? (
              <p className="mt-2 text-slate-500 text-xs leading-5">
                {project.edit.decision.summary}
              </p>
            ) : null}

            {project.edit.error || editStreamState.error ? (
              <p className="mt-3 text-red-300 text-sm">
                {project.edit.error ?? "Unable to connect to the edit stream."}
              </p>
            ) : null}
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-slate-500 text-xs uppercase tracking-widest">
              Selected frame
            </p>
            {selectedScreen ? (
              <>
                <h2 className="mt-2 truncate font-semibold text-lg text-white">
                  {selectedScreen.name}
                </h2>
                <p className="mt-1 text-slate-400 text-sm">
                  {selectedScreen.width} x {selectedScreen.height}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyHtml}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 font-medium text-slate-100 text-xs transition hover:border-cyan-300 hover:text-cyan-100"
                  >
                    <Clipboard className="size-3.5" />
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExportImage("png")}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 font-medium text-slate-100 text-xs transition hover:border-cyan-300 hover:text-cyan-100"
                  >
                    <FileImage className="size-3.5" />
                    PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExportImage("jpg")}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 font-medium text-slate-100 text-xs transition hover:border-cyan-300 hover:text-cyan-100"
                  >
                    <Download className="size-3.5" />
                    JPG
                  </button>
                </div>
                {exportStatus ? (
                  <p className="mt-3 text-emerald-300 text-sm">
                    {exportStatus}
                  </p>
                ) : null}
                {exportError ? (
                  <p className="mt-3 text-red-300 text-sm">{exportError}</p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-slate-400 text-sm leading-6">
                Select a completed frame on the canvas to copy or export it.
              </p>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-slate-400 text-sm">UI frames</p>
              <h2 className="font-semibold text-2xl text-white">
                {project.generatedScreens.length} of{" "}
                {project.screens.length || "..."} ready
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
            selectedScreenId={selectedScreenId}
            onSelectScreen={handleSelectScreen}
          />
        </div>
      </div>
    </section>
  )
}
