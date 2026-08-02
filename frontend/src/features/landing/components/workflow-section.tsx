import { Code2, Cpu, TerminalSquare } from "lucide-react"
import { WorkflowCard } from "~/features/landing/components/workflow-card"

const steps = [
  {
    step: "01",
    icon: <TerminalSquare className="size-4" />,
    title: "Prompt",
    description:
      "Describe your vision in natural language. Be as specific or as vague as you like.",
  },
  {
    step: "02",
    icon: <Cpu className="size-4" />,
    title: "Iterate",
    description:
      "Sappy plots layout variations in seconds, applying design tokens and accessible defaults.",
  },
  {
    step: "03",
    icon: <Code2 className="size-4" />,
    title: "Export",
    description:
      "One-click export to clean, semantic React and Tailwind you can ship.",
  },
]

export const WorkflowSection = () => (
  <section className="mx-auto max-w-5xl px-6 py-24">
    <div className="flex items-end justify-between">
      <div>
        <span className="readout text-primary">the sequence</span>
        <h2 className="mt-3 font-semibold text-2xl tracking-tight">
          How it works
        </h2>
      </div>
      <p className="hidden max-w-xs text-muted-foreground text-sm sm:block">
        From concept to code in three steps.
      </p>
    </div>

    <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
      {steps.map((item) => (
        <WorkflowCard
          key={item.step}
          step={item.step}
          icon={item.icon}
          title={item.title}
          description={item.description}
        />
      ))}
    </div>
  </section>
)
