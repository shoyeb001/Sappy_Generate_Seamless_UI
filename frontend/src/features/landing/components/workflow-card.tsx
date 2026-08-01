import { Card, CardContent, CardFooter } from "~/shared/components/ui/card"

interface WorkflowCardProps {
  step: string
  title: string
  description: string
  icon: React.ReactNode
  footer: React.ReactNode
}

export const WorkflowCard = ({
  step,
  title,
  description,
  icon,
  footer,
}: WorkflowCardProps) => (
  <Card className="group relative h-full transition-colors hover:ring-primary/30">
    <span className="pointer-events-none absolute top-2 right-6 z-0 select-none font-bold text-[120px] text-muted/40 leading-none">
      {step}
    </span>

    <CardContent className="relative z-10 flex-1">
      <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-3 font-semibold text-foreground text-xl">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </CardContent>
    <CardFooter className="relative z-10 mt-auto bg-transparent">
      {footer}
    </CardFooter>
  </Card>
)
