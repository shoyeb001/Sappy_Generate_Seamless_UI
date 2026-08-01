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
  <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 transition-colors hover:border-slate-700">
    {/* Large Background Number */}
    <div className="absolute top-2 right-6 z-0 select-none font-bold text-[120px] text-slate-800/20 leading-none">
      {step}
    </div>

    <div className="relative z-10 flex-1">
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
        {icon}
      </div>
      <h3 className="mb-3 font-semibold text-white text-xl">{title}</h3>
      <p className="mb-8 text-slate-400 text-sm leading-relaxed">
        {description}
      </p>
    </div>
    <div className="relative z-10 mt-auto border-slate-800/50 border-t pt-4">
      {footer}
    </div>
  </div>
)
