import { zodResolver } from "@hookform/resolvers/zod"
import { LockKeyhole, Mail, Sparkles } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router"
import { useLoginMutation, useSignupMutation } from "~/features/auth/api"
import {
  type AuthCredentials,
  authCredentialsSchema,
} from "~/features/auth/types"
import { Alert, AlertDescription } from "~/shared/components/ui/alert"
import { Button } from "~/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/shared/components/ui/field"
import { Input } from "~/shared/components/ui/input"
import { parseError } from "~/shared/lib/parse-error"

type AuthMode = "login" | "signup"

export const AuthPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>("login")
  const [login, loginState] = useLoginMutation()
  const [signup, signupState] = useSignupMutation()

  const form = useForm<AuthCredentials>({
    resolver: zodResolver(authCredentialsSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  })
  const { errors, isSubmitting } = form.formState

  const serverError = loginState.error ?? signupState.error
  const submitLabel = mode === "login" ? "Log in" : "Create account"

  const nextPathParam = searchParams.get("next")
  const nextPath = nextPathParam?.startsWith("/") ? nextPathParam : "/"

  const onSubmit = async (values: AuthCredentials) => {
    try {
      if (mode === "login") {
        await login(values).unwrap()
      } else {
        await signup(values).unwrap()
      }

      navigate(mode === "signup" ? "/settings?required=1" : nextPath)
    } catch {
      // RTK Query exposes the error through mutation state for rendering.
    }
  }

  const toggleMode = () => {
    setMode((current) => (current === "login" ? "signup" : "login"))
    form.reset()
    loginState.reset()
    signupState.reset()
  }

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
          <Sparkles className="size-3.5" />
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    className="h-10 pl-8"
                    {...form.register("email")}
                  />
                </div>
                <FieldError errors={[errors.email]} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <LockKeyhole className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    placeholder="At least 6 characters"
                    aria-invalid={!!errors.password}
                    className="h-10 pl-8"
                    {...form.register("password")}
                  />
                </div>
                <FieldError errors={[errors.password]} />
              </Field>

              {serverError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {parseError(serverError, "Authentication failed.")}
                  </AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="h-10 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Please wait..." : submitLabel}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={toggleMode}
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
