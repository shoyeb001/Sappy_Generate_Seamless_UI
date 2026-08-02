import { Loader2, WandSparkles, X } from "lucide-react"
import type { ProjectGenerationState } from "~/features/generation/slice"
import type { GeneratedScreen } from "~/features/generation/types"
import { Button } from "~/shared/components/ui/button"
import { Textarea } from "~/shared/components/ui/textarea"

type EditFramePanelProps = {
  edit: ProjectGenerationState["edit"]
  selectedScreen: GeneratedScreen | null
  instruction: string
  onInstructionChange: (value: string) => void
  onClearSelected: () => void
  onApply: () => void
  isApplying: boolean
  streamError: unknown
}

export const EditFramePanel = ({
  edit,
  selectedScreen,
  instruction,
  onInstructionChange,
  onClearSelected,
  onApply,
  isApplying,
  streamError,
}: EditFramePanelProps) => {
  const isBusy =
    edit.status === "understanding" ||
    edit.status === "regenerating" ||
    isApplying

  return (
    <div className="mt-6 border border-border bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="readout">edit frame</p>
        {edit.status === "understanding" || edit.status === "regenerating" ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : null}
      </div>

      <div className="mt-3 min-h-8">
        {selectedScreen ? (
          <span className="inline-flex max-w-full items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-1.5 font-medium text-primary text-xs">
            <span className="truncate">{selectedScreen.name}</span>
            <button
              type="button"
              onClick={onClearSelected}
              className="inline-flex size-5 shrink-0 items-center justify-center text-primary transition hover:bg-primary/20"
              aria-label="Remove selected frame"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ) : (
          <p className="text-muted-foreground text-sm leading-6">
            Select one completed frame to edit it.
          </p>
        )}
      </div>

      <Textarea
        value={instruction}
        onChange={(event) => onInstructionChange(event.target.value)}
        placeholder="Describe the change for the selected frame..."
        className="mt-4 min-h-28"
      />

      <Button
        type="button"
        size="lg"
        onClick={onApply}
        disabled={!selectedScreen || !instruction.trim() || isBusy}
        className="mt-3 h-9 w-full"
      >
        {isBusy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <WandSparkles className="size-4" />
        )}
        Apply edit
      </Button>

      {edit.status !== "idle" ? (
        <p className="mt-3 text-muted-foreground text-sm">
          {edit.status === "understanding"
            ? "Understanding the edit..."
            : edit.status === "regenerating"
              ? "Regenerating the selected frame..."
              : edit.status === "completed"
                ? "Selected frame updated."
                : "Edit failed."}
        </p>
      ) : null}

      {edit.decision ? (
        <p className="mt-2 text-muted-foreground text-xs leading-5">
          {edit.decision.summary}
        </p>
      ) : null}

      {edit.error || streamError ? (
        <p className="mt-3 text-destructive text-sm">
          {edit.error ?? "Unable to connect to the edit stream."}
        </p>
      ) : null}
    </div>
  )
}
