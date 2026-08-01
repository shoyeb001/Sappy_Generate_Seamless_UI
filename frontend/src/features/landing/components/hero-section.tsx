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
    <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-28 pb-20 text-center">
      <Badge variant="outline" className="mb-6 gap-1.5 font-normal">
        <Sparkles className="size-3" />
        Powered by Sappy's visual LLM
      </Badge>

      <h1 className="mb-5 max-w-2xl font-semibold text-4xl tracking-tight md:text-5xl">
        Design logic at the speed of thought.
      </h1>
      <p className="mb-10 max-w-xl text-base text-muted-foreground leading-relaxed">
        Generate production-ready UI components and layouts from a single
        sentence.
      </p>

      <form
        onSubmit={submitPrompt}
        className="flex w-full max-w-2xl items-center gap-2 rounded-lg border border-border bg-card p-1.5"
      >
        <Sparkles className="ml-2 size-4 shrink-0 text-muted-foreground" />
        <Input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe your app idea..."
          className="h-9 flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button type="submit" disabled={!prompt.trim()}>
          Generate <ArrowRight className="size-4" />
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
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
