import { Button } from "~/shared/components/ui/button"

export const CtaSection = () => (
  <section className="px-6 py-24">
    <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-12 text-center">
      <h2 className="font-semibold text-3xl tracking-tight">Ready to build?</h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
        Turn a sentence into a working interface. Get started for free — no
        credit card required.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto">Create your first app</Button>
        <Button variant="outline" className="w-full sm:w-auto">
          Watch demo
        </Button>
      </div>
    </div>
  </section>
)
