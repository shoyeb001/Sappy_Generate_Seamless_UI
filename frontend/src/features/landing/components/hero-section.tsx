import { ArrowRight, Sparkles } from "lucide-react"
import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router"
import { startProject } from "~/features/generation/slice"
import { Badge } from "~/shared/components/ui/badge"
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
  "A one page portfolio website with intro, projects and contact section",
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

  const applySuggestion = (suggestion: string) => {
    setPrompt(suggestion)
  }

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center">
      <div className="pointer-events-none absolute top-0 left-1/2 h-100 w-150 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

      <Badge variant="outline" className="relative mb-6 gap-1.5">
        <Sparkles className="size-3 text-primary" />
        Powered by Sappy's visual LLM
      </Badge>

      <h1 className="relative mb-6 max-w-4xl font-bold text-5xl leading-tight tracking-tight md:text-7xl">
        Design logic at the <br />
        <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          speed of thought.
        </span>
      </h1>
      <p className="relative mb-10 max-w-2xl text-lg text-muted-foreground">
        Generate high-fidelity, production-ready UI components and layouts from
        a single sentence. Powered by Sappy's advanced visual LLM.
      </p>

      <form
        onSubmit={submitPrompt}
        className="relative flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-primary/5"
      >
        <Sparkles className="ml-2 size-5 shrink-0 text-muted-foreground" />
        <Input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe your app idea..."
          className="h-10 flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button
          type="submit"
          size="lg"
          className="h-10 px-5 font-semibold"
          disabled={!prompt.trim()}
        >
          Generate <ArrowRight className="size-4" />
        </Button>
      </form>

      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="text-muted-foreground">Try:</span>
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applySuggestion(suggestion)}
            className="rounded-full font-normal text-muted-foreground"
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </section>
  )
}
