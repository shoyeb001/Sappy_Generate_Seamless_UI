import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import {
  useStartGenerationStreamMutation,
  useStartScreenEditStreamMutation,
} from "~/features/generation/api"
import { ProjectSidebar } from "~/features/generation/components/project-sidebar"
import { ScreenFlowCanvas } from "~/features/generation/components/screen-flow-canvas"
import { settingsApi } from "~/features/settings/api"
import { Button } from "~/shared/components/ui/button"
import { useAppDispatch, useAppSelector } from "~/shared/hooks/use-app-store"

export const ProjectPage = () => {
  const { projectId } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const startedRef = useRef(false)
  const [startGeneration, streamState] = useStartGenerationStreamMutation()
  const [startScreenEdit, editStreamState] = useStartScreenEditStreamMutation()
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null)
  const [editInstruction, setEditInstruction] = useState("")

  const project = useAppSelector((state) =>
    projectId ? state.generation.projects[projectId] : undefined
  )

  const streamErrorStatus =
    streamState.error && typeof streamState.error === "object"
      ? (streamState.error as { status?: number | string }).status
      : undefined

  useEffect(() => {
    if (!projectId || streamErrorStatus !== 403) {
      return
    }

    navigate(
      `/settings?required=1&next=${encodeURIComponent(`/project/${projectId}`)}`
    )
  }, [navigate, projectId, streamErrorStatus])

  useEffect(() => {
    if (!projectId || !project?.prompt || startedRef.current) {
      return
    }

    const controller = new AbortController()

    const startIfConfigured = async () => {
      const status = await dispatch(
        settingsApi.endpoints.getLLMCredentialsStatus.initiate()
      ).unwrap()

      if (!status.is_complete) {
        navigate(
          `/settings?required=1&next=${encodeURIComponent(`/project/${projectId}`)}`
        )
        return
      }

      startedRef.current = true
      await startGeneration({ projectId, prompt: project.prompt })
    }

    void startIfConfigured().catch(() => {
      if (!controller.signal.aborted) {
        navigate(
          `/settings?required=1&next=${encodeURIComponent(`/project/${projectId}`)}`
        )
      }
    })

    return () => controller.abort()
  }, [dispatch, navigate, project?.prompt, projectId, startGeneration])

  const selectedScreen =
    project?.generatedScreens.find(
      (screen) => screen.id === selectedScreenId
    ) ?? null
  const selectedScreenPlan =
    project?.screens.find((screen) => screen.id === selectedScreenId) ?? null

  const handleSelectScreen = (screenId: string | null) => {
    setSelectedScreenId(screenId)
  }

  const handleClearSelectedScreen = () => {
    setSelectedScreenId(null)
  }

  const handleApplyEdit = async () => {
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

  if (!projectId || !project) {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <span className="readout mb-5 text-primary">no active prompt</span>
        <h1 className="font-semibold text-4xl text-foreground tracking-tight">
          Start from the landing page
        </h1>
        <p className="mt-4 text-muted-foreground">
          This project route needs a prompt from the generator form.
        </p>
        <Button
          size="lg"
          className="mt-8 h-10 px-5"
          render={<Link to="/">Create a UI</Link>}
        />
      </section>
    )
  }

  return (
    <section className="min-h-screen px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <ProjectSidebar
          project={project}
          selectedScreen={selectedScreen}
          streamError={streamState.error}
          editInstruction={editInstruction}
          onEditInstructionChange={setEditInstruction}
          onClearSelected={handleClearSelectedScreen}
          onApplyEdit={() => void handleApplyEdit()}
          isApplyingEdit={editStreamState.isLoading}
          editStreamError={editStreamState.error}
        />

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-border border-b pb-4">
            <div>
              <span className="readout text-primary">canvas · ui frames</span>
              <h2 className="mt-2 font-semibold text-2xl text-foreground tracking-tight">
                {project.generatedScreens.length} of{" "}
                {project.screens.length || "…"} ready
              </h2>
            </div>
            <span className="readout">design stream</span>
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
