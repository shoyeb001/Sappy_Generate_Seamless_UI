import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getLLMCredentialsStatus,
  saveLLMCredentials,
  type LLMCredentialsStatus,
} from "@/store/settings-api"
import { useAppSelector } from "@/store/store"
import { KeyRound, ShieldCheck, TriangleAlert } from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"

function parseError(error: unknown) {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as { detail?: string }
      return parsed.detail ?? error.message
    } catch {
      return error.message
    }
  }

  return "Unable to save provider credentials."
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const session = useAppSelector((state) => state.auth.session)
  const [openrouterApiKey, setOpenrouterApiKey] = useState("")
  const [huggingfaceToken, setHuggingfaceToken] = useState("")
  const [status, setStatus] = useState<LLMCredentialsStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const nextPath = useMemo(() => {
    const next = searchParams.get("next")
    return next?.startsWith("/") ? next : "/"
  }, [searchParams])
  const isRequired = searchParams.get("required") === "1"

  useEffect(() => {
    if (!session) {
      navigate(`/auth?next=${encodeURIComponent("/settings")}`)
      return
    }

    const controller = new AbortController()
    setIsLoading(true)

    getLLMCredentialsStatus(controller.signal)
      .then((credentialsStatus) => {
        setStatus(credentialsStatus)
      })
      .catch((caughtError: unknown) => {
        if (!controller.signal.aborted) {
          setError(parseError(caughtError))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [navigate, session])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setIsSaving(true)

    try {
      const result = await saveLLMCredentials({
        openrouter_api_key: openrouterApiKey.trim(),
        huggingface_token: huggingfaceToken.trim(),
      })
      setStatus(result.credentials)
      setOpenrouterApiKey("")
      setHuggingfaceToken("")
      setMessage("Provider keys saved.")

      if (isRequired) {
        navigate(nextPath)
      }
    } catch (caughtError) {
      setError(parseError(caughtError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[72vh] max-w-2xl flex-col justify-center px-6 py-16 text-slate-100">
      <Badge className="mb-5 w-fit gap-2">
        <KeyRound className="size-3" />
        Provider settings
      </Badge>
      <h1 className="text-4xl font-bold text-white">Connect your AI keys</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Add your OpenRouter API key and Hugging Face token. They are encrypted
        before being stored in Postgres.
      </p>

      {isRequired ? (
        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Add both provider keys before generating UI. The generation API is
            disabled for accounts without these settings.
          </p>
        </div>
      ) : null}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Current status</p>
            <p className="mt-1 text-sm text-slate-400">
              {isLoading
                ? "Checking saved keys..."
                : status?.is_complete
                  ? "Both provider keys are saved."
                  : "Provider keys are incomplete."}
            </p>
          </div>
          <ShieldCheck
            className={
              status?.is_complete ? "size-6 text-emerald-300" : "size-6 text-slate-600"
            }
          />
        </div>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
      >
        <label
          className="block text-sm font-medium text-slate-300"
          htmlFor="openrouter-api-key"
        >
          OpenRouter API key
        </label>
        <input
          id="openrouter-api-key"
          type="password"
          autoComplete="off"
          value={openrouterApiKey}
          onChange={(event) => setOpenrouterApiKey(event.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 text-sm text-white outline-none placeholder:text-slate-600"
          placeholder="sk-or-..."
        />

        <label
          className="mt-5 block text-sm font-medium text-slate-300"
          htmlFor="huggingface-token"
        >
          Hugging Face token
        </label>
        <input
          id="huggingface-token"
          type="password"
          autoComplete="off"
          value={huggingfaceToken}
          onChange={(event) => setHuggingfaceToken(event.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 text-sm text-white outline-none placeholder:text-slate-600"
          placeholder="hf_..."
        />

        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            className="h-10 rounded-xl px-5"
            disabled={
              isSaving ||
              openrouterApiKey.trim().length < 10 ||
              huggingfaceToken.trim().length < 10
            }
          >
            {isSaving ? "Saving..." : "Save keys"}
          </Button>
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-xl border border-slate-700 px-4 text-sm text-slate-300 transition hover:border-cyan-300 hover:text-white"
          >
            Back home
          </Link>
        </div>
      </form>
    </section>
  )
}
