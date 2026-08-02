import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import type { ProjectStep, StepState } from "~/features/generation/lib/steps"

function StepIcon({ state }: { state: StepState }) {
  if (state === "complete") {
    return <CheckCircle2 className="size-5 text-primary" />
  }
  if (state === "failed") {
    return <XCircle className="size-5 text-destructive" />
  }
  if (state === "active") {
    return <Loader2 className="size-5 animate-spin text-primary" />
  }
  return <Circle className="size-5 text-muted-foreground" />
}

export const StepList = ({ steps }: { steps: ProjectStep[] }) => (
  <div className="mt-6 space-y-4">
    {steps.map((step) => (
      <div key={step.label} className="flex items-center gap-3">
        <StepIcon state={step.state} />
        <span className="text-foreground text-sm">{step.label}</span>
      </div>
    ))}
  </div>
)
