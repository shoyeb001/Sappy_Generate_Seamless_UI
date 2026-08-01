import { Code2, Cpu, Sparkles, TerminalSquare } from "lucide-react"
import { WorkflowCard } from "~/features/landing/components/workflow-card"
import { Badge } from "~/shared/components/ui/badge"

export const WorkflowSection = () => (
  <section className="mx-auto max-w-7xl px-6 py-20">
    <div className="mb-12">
      <h2 className="mb-2 font-bold text-3xl text-foreground">
        The Neural Workflow
      </h2>
      <p className="text-muted-foreground">
        From concept to code in three seamless phases. No friction, just pure
        creation.
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <WorkflowCard
        step="1"
        icon={<TerminalSquare size={20} />}
        title="Prompt"
        description="Describe your vision using natural language. Be as specific or as vague as you like—the AI handles the nuance."
        footer={
          <span className="flex items-center font-medium text-primary text-xs">
            <Sparkles size={12} className="mr-1" /> Semantic analysis active
          </span>
        }
      />
      <WorkflowCard
        step="2"
        icon={<Cpu size={20} />}
        title="AI Iterates"
        description="Sappy generates multiple layout variations in seconds, applying intelligent design tokens and accessibility standards."
        footer={
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 rounded-full bg-linear-to-r from-primary to-primary/60" />
          </div>
        }
      />
      <WorkflowCard
        step="3"
        icon={<Code2 size={20} />}
        title="Export Code"
        description="One-click export to React, Tailwind, or Figma. Clean, semantic code that looks like it was written by a human."
        footer={
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-[10px]">
              react.tsx
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              next.js
            </Badge>
          </div>
        }
      />
    </div>
  </section>
)
