import { Button } from "~/components/ui/button"

export const CtaSection = () => (
  <section className="px-6 py-24">
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-card p-12 text-center shadow-2xl">
      <div className="pointer-events-none absolute top-0 left-1/2 h-125 w-125 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />

      <div className="relative z-10">
        <h2 className="mb-4 font-bold text-4xl text-foreground tracking-tight md:text-5xl">
          Ready to transcend <br /> standard design?
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
          Join 50,000+ designers and engineers building the future of the web
          with Sappy AI. Get started for free today.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="h-12 w-full px-8 text-base sm:w-auto">
            Create My First App
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full px-8 text-base sm:w-auto"
          >
            Watch Demo
          </Button>
        </div>
        <p className="mt-6 text-muted-foreground text-xs">
          No credit card required • Unlimited local exports
        </p>
      </div>
    </div>
  </section>
)
