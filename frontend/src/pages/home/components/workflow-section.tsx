import { Code2, Cpu, Sparkles, TerminalSquare } from "lucide-react";
import { WorkflowCard } from "./workflow-cards";
import { Badge } from "@/components/ui/badge";

export const WorkflowSection = () => (
    <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">The Neural Workflow</h2>
            <p className="text-slate-400">From concept to code in three seamless phases. No friction, just pure creation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WorkflowCard
                step="1"
                icon={<TerminalSquare size={20} />}
                title="Prompt"
                description="Describe your vision using natural language. Be as specific or as vague as you like—the AI handles the nuance."
                footer={<span className="text-cyan-400 flex items-center text-xs font-medium"><Sparkles size={12} className="mr-1" /> Semantic analysis active</span>}
            />
            <WorkflowCard
                step="2"
                icon={<Cpu size={20} />}
                title="AI Iterates"
                description="Aether generates multiple layout variations in seconds, applying intelligent design tokens and accessibility standards."
                footer={
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
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
                        <Badge className="text-[10px] bg-slate-800 text-slate-300 border-none">react.tsx</Badge>
                        <Badge className="text-[10px] bg-slate-800 text-slate-300 border-none">next.js</Badge>
                    </div>
                }
            />
        </div>
    </section>
);