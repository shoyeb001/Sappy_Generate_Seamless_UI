interface WorkflowCardProps {
    step: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    footer: React.ReactNode;
}

export const WorkflowCard = ({ step, title, description, icon, footer }: WorkflowCardProps) => (
    <div className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col h-full overflow-hidden group hover:border-slate-700 transition-colors">
        {/* Large Background Number */}
        <div className="absolute top-2 right-6 text-[120px] font-bold text-slate-800/20 leading-none select-none z-0">
            {step}
        </div>

        <div className="relative z-10 flex-1">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">{description}</p>
        </div>
        <div className="relative z-10 mt-auto pt-4 border-t border-slate-800/50">
            {footer}
        </div>
    </div>
);