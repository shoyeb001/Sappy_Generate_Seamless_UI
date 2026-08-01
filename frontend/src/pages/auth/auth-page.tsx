import { LockKeyhole, Mail, Sparkles } from "lucide-react"
import { type FormEvent, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { useLoginMutation, useSignupMutation } from "~/store/auth-api"

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
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <span className="font-medium text-muted-foreground text-sm">
          Sappy account
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === "login" ? "Log in to generate UI" : "Create your account"}
          </CardTitle>
          <CardDescription>
            Email and password only. No verification code is required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="grid gap-5"
          >
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 pl-8"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 pl-8"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="h-10 w-full"
              disabled={!email.trim() || password.length < 6 || isLoading}
            >
              {isLoading ? "Please wait..." : submitLabel}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="font-medium text-primary transition-colors hover:text-primary/80"
        >
          {mode === "login" ? "Create an account" : "Already have an account?"}
        </button>
        <Link
          to="/"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Back home
        </Link>
      </div>
    </section>
  )
}
