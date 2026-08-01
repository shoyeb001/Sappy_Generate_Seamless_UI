import { Code2, Cpu, Sparkles, TerminalSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { WorkflowCard } from "./workflow-cards"

export const WorkflowSection = () => (
  <section className="mx-auto max-w-7xl px-6 py-20">
    <div className="mb-12">
      <h2 className="mb-2 font-bold text-3xl text-white">
        The Neural Workflow
      </h2>
      <p className="text-slate-400">
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
          <span className="flex items-center font-medium text-cyan-400 text-xs">
            <Sparkles size={12} className="mr-1" /> Semantic analysis active
          </span>
        }
      />
      <WorkflowCard
        step="2"
        icon={<Cpu size={20} />}
        title="AI Iterates"
        description="Aether generates multiple layout variations in seconds, applying intelligent design tokens and accessibility standards."
        footer={
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
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
            <Badge className="border-none bg-slate-800 text-[10px] text-slate-300">
              react.tsx
            </Badge>
            <Badge className="border-none bg-slate-800 text-[10px] text-slate-300">
              next.js
            </Badge>
          </div>
        }
      />
    </div>
  </section>
)
