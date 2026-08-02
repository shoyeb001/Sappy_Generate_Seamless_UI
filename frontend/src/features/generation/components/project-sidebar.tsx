import { EditFramePanel } from "~/features/generation/components/edit-frame-panel"
import { ExportControls } from "~/features/generation/components/export-controls"
import { StepList } from "~/features/generation/components/step-list"
import { buildSteps, statusCopy } from "~/features/generation/lib/steps"
import type { ProjectGenerationState } from "~/features/generation/slice"
import type { GeneratedScreen } from "~/features/generation/types"
import { Alert, AlertDescription } from "~/shared/components/ui/alert"
import { parseError } from "~/shared/lib/parse-error"

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
    <aside className="crop-frame h-fit border border-border bg-card p-5">
      <div className="flex items-center justify-between border-border border-b pb-4">
        <div>
          <span className="readout text-primary">design status</span>
          <h1 className="mt-2 font-semibold text-foreground">
            {statusCopy[project.status]}
          </h1>
        </div>
        <span className="readout">S · flow</span>
      </div>

      <div className="mt-6 border border-border bg-muted/40 p-4">
        <p className="readout">prompt</p>
        <p className="mt-2 text-foreground text-sm leading-6">
          {project.prompt}
        </p>
      </div>

      <StepList steps={steps} />

      {project.project ? (
        <div className="mt-6 border border-border bg-muted/40 p-4">
          <p className="readout">project</p>
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
            {project.error ??
              parseError(
                streamError,
                "Unable to connect to the generation stream."
              )}
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

      <div className="mt-6 border border-border bg-muted/40 p-4">
        <p className="readout">selected frame</p>
        {selectedScreen ? (
          <>
            <h2 className="mt-2 truncate font-semibold text-foreground text-lg">
              {selectedScreen.name}
            </h2>
            <p className="mt-1 font-mono text-muted-foreground text-xs tabular-nums">
              {selectedScreen.width} × {selectedScreen.height}
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
