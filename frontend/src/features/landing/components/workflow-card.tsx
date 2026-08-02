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
  <div className="group bg-card p-6 transition-colors hover:bg-accent/40">
    <div className="flex items-center justify-between">
      <span className="flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
        {icon}
      </span>
      <span className="readout text-2xl text-muted-foreground tracking-normal transition-colors group-hover:text-primary">
        {step}
      </span>
    </div>
    <h3 className="mt-5 font-medium text-foreground">{title}</h3>
    <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
  </div>
)
