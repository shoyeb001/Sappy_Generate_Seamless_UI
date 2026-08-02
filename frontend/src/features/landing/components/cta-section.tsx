import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { Button } from "~/shared/components/ui/button"

export const CtaSection = () => (
  <section className="px-6 py-24">
    <div className="crop-frame mx-auto max-w-3xl border border-border bg-card p-12 text-center">
      <span className="readout text-primary">new artboard</span>
      <h2 className="mt-4 font-semibold text-3xl tracking-tight">
        Ready to draft?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground text-sm leading-relaxed">
        Turn a sentence into a working interface. Get started free — no credit
        card required.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          className="h-10 w-full px-4 sm:w-auto"
          render={
            <Link to="/">
              Create your first app <ArrowRight className="size-4" />
            </Link>
          }
        />
        <Button
          variant="outline"
          className="h-10 w-full px-4 sm:w-auto"
          render={<Link to="/auth">Log in</Link>}
        />
      </div>
    </div>
  </section>
)
