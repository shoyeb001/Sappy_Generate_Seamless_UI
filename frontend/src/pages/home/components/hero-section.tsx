import { Sparkles } from "lucide-react"
import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { startProject } from "@/store/generation-slice"
import { useAppDispatch, useAppSelector } from "@/store/store"

function createProjectId() {
  if (window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

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
    <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
      {/* <Badge className="mb-6 tracking-widest uppercase text-[10px]">Aether v2.0 Preview</Badge> */}
      <h1 className="mb-6 max-w-4xl font-bold text-5xl text-white leading-tight tracking-tight md:text-7xl">
        Design logic at the <br />
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          speed of thought.
        </span>
      </h1>
      <p className="mb-10 max-w-2xl text-lg text-slate-400">
        Generate high-fidelity, production-ready UI components and layouts from
        a single sentence. Powered by Aether's advanced visual LLM.
      </p>

      <form
        onSubmit={submitPrompt}
        className="flex w-full max-w-3xl items-center rounded-2xl border border-slate-700/50 bg-slate-900/50 p-2 shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)] backdrop-blur-sm"
      >
        <Sparkles className="mr-2 ml-3 text-slate-400" size={20} />
        <input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe your app idea..."
          className="flex-1 border-none bg-transparent px-2 text-slate-200 outline-none placeholder:text-slate-500"
        />
        <Button
          type="submit"
          className="rounded-xl px-6 font-semibold shadow-cyan-500/25"
          disabled={!prompt.trim()}
        >
          Generate <Sparkles size={16} className="ml-2" />
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3 text-sm">
        <span className="text-slate-500">Try:</span>
        <button
          type="button"
          onClick={() =>
            applySuggestion("A crypto dashboard with dark mode accents")
          }
          className="rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1 text-slate-300 transition-colors hover:bg-slate-800"
        >
          "Create a one page protfolio website with intro, projects and contact
          section"
        </button>
        <button
          type="button"
          onClick={() => applySuggestion("Minimalist task manager for iOS")}
          className="hidden rounded-full border border-slate-700/50 bg-slate-800/50 px-3 py-1 text-slate-300 transition-colors hover:bg-slate-800 sm:block"
        >
          "Minimalist task manager for iOS"
        </button>
      </div>
    </section>
  )
}
