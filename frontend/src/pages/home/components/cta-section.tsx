import { Button } from "@/components/ui/button"

export const CtaSection = () => (
  <section className="px-6 py-24">
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-b from-slate-800/40 to-slate-900/40 p-12 text-center shadow-2xl">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px]"></div>

      <div className="relative z-10">
        <h2 className="mb-4 font-bold text-4xl text-white tracking-tight md:text-5xl">
          Ready to transcend <br /> standard design?
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-slate-400">
          Join 50,000+ designers and engineers building the future of the web
          with Aether UI. Get started for free today.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button className="h-12 w-full px-8 text-base sm:w-auto">
            Create My First App
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full bg-slate-900/50 px-8 text-base sm:w-auto"
          >
            Watch Demo
          </Button>
        </div>
        <p className="mt-6 text-slate-500 text-xs">
          No credit card required • Unlimited local exports
        </p>
      </div>
    </div>
  </section>
)
