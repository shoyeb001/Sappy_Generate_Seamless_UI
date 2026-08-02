import { ArrowRight } from "lucide-react"
import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router"
import { startProject } from "~/features/generation/slice"
import { Button } from "~/shared/components/ui/button"
import { Input } from "~/shared/components/ui/input"
import { useAppDispatch, useAppSelector } from "~/shared/hooks/use-app-store"

function createProjectId() {
  if (window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const suggestions = [
  "A one-page portfolio with intro, projects and contact",
  "Minimalist task manager for iOS",
]

export const HeroSection = () => {
  const [prompt, setPrompt] = useState("")
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const session = useAppSelector((state) => state.auth.session)

  const submitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      return
    }

    if (!session) {
      navigate("/auth?next=/")
      return
    }

    const projectId = createProjectId()
    dispatch(startProject({ projectId, prompt: trimmedPrompt }))
    navigate(`/project/${projectId}`)
  }

  return (
    <section className="relative overflow-hidden border-border border-b">
      <div className="plotter-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20">
        <div className="mb-8 flex items-center gap-3">
          <span className="readout text-primary">sappy/draft</span>
          <span className="h-px flex-1 bg-border" />
          <span className="readout">artboard 01</span>
        </div>

        {/* The artboard: crop-marked frame is the hero's thesis. */}
        <div className="crop-frame animate-mark-draw border border-border bg-card/60 px-6 py-14 text-foreground sm:px-14">
          <h1 className="max-w-2xl font-semibold text-4xl leading-[1.05] tracking-tight sm:text-6xl">
            Turn one sentence into a screen flow.
          </h1>
          <p className="mt-6 max-w-lg text-base text-muted-foreground leading-relaxed">
            Sappy drafts real, sized UI screens from a single prompt, then lets
            you edit any frame and export clean React and Tailwind.
          </p>

          <form
            onSubmit={submitPrompt}
            className="mt-10 flex w-full max-w-xl items-stretch border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
          >
            <span className="readout flex items-center border-border border-r px-3 text-primary">
              ▍
            </span>
            <Input
              type="text"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe your app idea…"
              className="h-11 flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              disabled={!prompt.trim()}
              className="h-11 px-4"
            >
              Plot <ArrowRight className="size-4" />
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="readout normal-case">try</span>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="text-muted-foreground text-sm underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="readout">1440 × 900</span>
          <span className="readout">status · ready</span>
        </div>
      </div>
    </section>
  )
}
