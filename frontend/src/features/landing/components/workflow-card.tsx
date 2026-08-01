import type { ReactNode } from "react"

type WorkflowCardProps = {
  step: string
  title: string
  description: string
  icon: ReactNode
}

export const WorkflowCard = ({
  step,
  title,
  description,
  icon,
}: WorkflowCardProps) => (
  <div className="bg-card p-6">
    <div className="flex items-center gap-3">
      <span className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground">
        {icon}
      </span>
      <span className="text-muted-foreground text-xs tabular-nums">{step}</span>
    </div>
    <h3 className="mt-4 font-medium text-foreground">{title}</h3>
    <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
  </div>
)
