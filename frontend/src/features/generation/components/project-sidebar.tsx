import { Sparkles } from "lucide-react"
import { EditFramePanel } from "~/features/generation/components/edit-frame-panel"
import { ExportControls } from "~/features/generation/components/export-controls"
import { StepList } from "~/features/generation/components/step-list"
import { buildSteps, statusCopy } from "~/features/generation/lib/steps"
import type { ProjectGenerationState } from "~/features/generation/slice"
import type { GeneratedScreen } from "~/features/generation/types"
import { Alert, AlertDescription } from "~/shared/components/ui/alert"

type ProjectSidebarProps = {
  project: ProjectGenerationState
  selectedScreen: GeneratedScreen | null
  streamError: unknown
  editInstruction: string
  onEditInstructionChange: (value: string) => void
  onClearSelected: () => void
  onApplyEdit: () => void
  isApplyingEdit: boolean
  editStreamError: unknown
}

export const ProjectSidebar = ({
  project,
  selectedScreen,
  streamError,
  editInstruction,
  onEditInstructionChange,
  onClearSelected,
  onApplyEdit,
  isApplyingEdit,
  editStreamError,
}: ProjectSidebarProps) => {
  const steps = buildSteps(project.events, project.status)

  return (
    <aside className="h-fit rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Design status</p>
          <h1 className="font-semibold text-foreground">
            {statusCopy[project.status]}
          </h1>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-muted-foreground text-xs uppercase tracking-widest">
          Prompt
        </p>
        <p className="mt-2 text-foreground text-sm leading-6">
          {project.prompt}
        </p>
      </div>

      <StepList steps={steps} />

      {project.project ? (
        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-muted-foreground text-xs uppercase tracking-widest">
            Project
          </p>
          <h2 className="mt-2 font-semibold text-foreground text-lg">
            {project.project.name}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {project.project.type}
          </p>
        </div>
      ) : null}

      {project.error || streamError ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>
            {project.error ?? "Unable to connect to the generation stream."}
          </AlertDescription>
        </Alert>
      ) : null}

      <EditFramePanel
        edit={project.edit}
        selectedScreen={selectedScreen}
        instruction={editInstruction}
        onInstructionChange={onEditInstructionChange}
        onClearSelected={onClearSelected}
        onApply={onApplyEdit}
        isApplying={isApplyingEdit}
        streamError={editStreamError}
      />

      <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-muted-foreground text-xs uppercase tracking-widest">
          Selected frame
        </p>
        {selectedScreen ? (
          <>
            <h2 className="mt-2 truncate font-semibold text-foreground text-lg">
              {selectedScreen.name}
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              {selectedScreen.width} x {selectedScreen.height}
            </p>
            <ExportControls screen={selectedScreen} />
          </>
        ) : (
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            Select a completed frame on the canvas to copy or export it.
          </p>
        )}
      </div>
    </aside>
  )
}
