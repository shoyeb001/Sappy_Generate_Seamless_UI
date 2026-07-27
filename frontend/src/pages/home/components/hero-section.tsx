import { Button } from "@/components/ui/button";
import { startProject } from "@/store/generation-slice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

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

  const useSuggestion = (suggestion: string) => {
    setPrompt(suggestion)
  }

  return (
    <section className="flex flex-col items-center justify-center text-center pt-24 pb-16 px-4">
      {/* <Badge className="mb-6 tracking-widest uppercase text-[10px]">Aether v2.0 Preview</Badge> */}
      <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight max-w-4xl leading-tight mb-6">
        Design logic at the <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          speed of thought.
        </span>
      </h1>
      <p className="text-slate-400 text-lg max-w-2xl mb-10">
        Generate high-fidelity, production-ready UI components and layouts from a single sentence. Powered by Aether's advanced visual LLM.
      </p>

      <form
        onSubmit={submitPrompt}
        className="w-full max-w-3xl bg-slate-900/50 border border-slate-700/50 rounded-2xl p-2 flex items-center shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)] backdrop-blur-sm"
      >
        <Sparkles className="text-slate-400 ml-3 mr-2" size={20} />
        <input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe your app idea..."
          className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-500 px-2"
        />
        <Button
          type="submit"
          className="rounded-xl px-6 font-semibold shadow-cyan-500/25"
          disabled={!prompt.trim()}
        >
          Generate <Sparkles size={16} className="ml-2" />
        </Button>
      </form>

      <div className="flex items-center gap-3 mt-6 text-sm">
        <span className="text-slate-500">Try:</span>
        <button
          type="button"
          onClick={() => useSuggestion("A crypto dashboard with dark mode accents")}
          className="bg-slate-800/50 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded-full transition-colors border border-slate-700/50"
        >
          "Create a one page protfolio website with intro, projects and contact section"
        </button>
        <button
          type="button"
          onClick={() => useSuggestion("Minimalist task manager for iOS")}
          className="bg-slate-800/50 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded-full transition-colors border border-slate-700/50 hidden sm:block"
        >
          "Minimalist task manager for iOS"
        </button>
      </div>
    </section>
  )
}
