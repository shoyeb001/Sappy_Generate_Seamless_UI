import { LockKeyhole, Mail, Sparkles } from "lucide-react"
import { type FormEvent, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLoginMutation, useSignupMutation } from "@/store/auth-api"

type AuthMode = "login" | "signup"

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return "Authentication failed."
  }

  if ("data" in error) {
    const data = error.data
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data) as { detail?: string }
        return parsed.detail ?? data
      } catch {
        return data
      }
    }

    if (data && typeof data === "object" && "detail" in data) {
      return String(data.detail)
    }
  }

  return "Authentication failed."
}

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [login, loginState] = useLoginMutation()
  const [signup, signupState] = useSignupMutation()

  const isLoading = loginState.isLoading || signupState.isLoading
  const error = loginState.error ?? signupState.error
  const submitLabel = mode === "login" ? "Log in" : "Create account"

  const nextPathParam = searchParams.get("next")
  const nextPath = nextPathParam?.startsWith("/") ? nextPathParam : "/"

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const credentials = {
      email: email.trim(),
      password,
    }

    if (!credentials.email || credentials.password.length < 6) {
      return
    }

    try {
      if (mode === "login") {
        await login(credentials).unwrap()
      } else {
        await signup(credentials).unwrap()
      }

      navigate(mode === "signup" ? "/settings?required=1" : nextPath)
    } catch {
      // RTK Query exposes the error through mutation state for rendering.
    }
  }

  return (
    <section className="mx-auto flex min-h-[72vh] max-w-md flex-col justify-center px-6 py-16 text-slate-100">
      <Badge className="mb-5 w-fit gap-2">
        <Sparkles className="size-3" />
        Aether account
      </Badge>
      <h1 className="font-bold text-4xl text-white">
        {mode === "login" ? "Log in to generate UI" : "Create your account"}
      </h1>
      <p className="mt-3 text-slate-400 text-sm leading-6">
        Email and password only. No verification code is required.
      </p>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
      >
        <label
          className="block font-medium text-slate-300 text-sm"
          htmlFor="email"
        >
          Email
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3">
          <Mail className="size-4 text-slate-500" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            placeholder="you@example.com"
          />
        </div>

        <label
          className="mt-5 block font-medium text-slate-300 text-sm"
          htmlFor="password"
        >
          Password
        </label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3">
          <LockKeyhole className="size-4 text-slate-500" />
          <input
            id="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            placeholder="At least 6 characters"
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200 text-sm">
            {getErrorMessage(error)}
          </p>
        ) : null}

        <Button
          type="submit"
          className="mt-6 h-10 w-full rounded-xl"
          disabled={!email.trim() || password.length < 6 || isLoading}
        >
          {isLoading ? "Please wait..." : submitLabel}
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-cyan-300 transition hover:text-cyan-100"
        >
          {mode === "login" ? "Create an account" : "Already have an account?"}
        </button>
        <Link to="/" className="text-slate-400 transition hover:text-white">
          Back home
        </Link>
      </div>
    </section>
  )
}
