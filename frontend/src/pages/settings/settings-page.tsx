import { KeyRound, ShieldCheck, TriangleAlert } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
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
import {
  getLLMCredentialsStatus,
  type LLMCredentialsStatus,
  saveLLMCredentials,
} from "~/store/settings-api"
import { useAppSelector } from "~/store/store"

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

  const nextPathParam = searchParams.get("next")
  const nextPath = nextPathParam?.startsWith("/") ? nextPathParam : "/"
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
    <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center px-6 py-16">
      <Badge variant="outline" className="mb-5 w-fit gap-2">
        <KeyRound className="size-3 text-primary" />
        Provider settings
      </Badge>
      <h1 className="font-bold text-4xl text-foreground">
        Connect your AI keys
      </h1>
      <p className="mt-3 max-w-lg text-muted-foreground text-sm leading-6">
        Add your OpenRouter API key and Hugging Face token. They are encrypted
        before being stored in Postgres.
      </p>

      {isRequired ? (
        <Alert className="mt-6 border-primary/30">
          <TriangleAlert className="text-primary" />
          <AlertDescription>
            Add both provider keys before generating UI. The generation API is
            disabled for accounts without these settings.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="mt-6">
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-foreground text-sm">
              Current status
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              {isLoading
                ? "Checking saved keys..."
                : status?.is_complete
                  ? "Both provider keys are saved."
                  : "Provider keys are incomplete."}
            </p>
          </div>
          <ShieldCheck
            className={
              status?.is_complete
                ? "size-6 text-primary"
                : "size-6 text-muted-foreground"
            }
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Provider credentials</CardTitle>
          <CardDescription>
            These keys are used to power UI generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="grid gap-5"
          >
            <div className="grid gap-2">
              <Label htmlFor="openrouter-api-key">OpenRouter API key</Label>
              <Input
                id="openrouter-api-key"
                type="password"
                autoComplete="off"
                value={openrouterApiKey}
                onChange={(event) => setOpenrouterApiKey(event.target.value)}
                className="h-10"
                placeholder="sk-or-..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="huggingface-token">Hugging Face token</Label>
              <Input
                id="huggingface-token"
                type="password"
                autoComplete="off"
                value={huggingfaceToken}
                onChange={(event) => setHuggingfaceToken(event.target.value)}
                className="h-10"
                placeholder="hf_..."
              />
            </div>

            {message ? (
              <Alert className="border-primary/30">
                <AlertDescription className="text-foreground">
                  {message}
                </AlertDescription>
              </Alert>
            ) : null}
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                size="lg"
                className="h-10"
                disabled={
                  isSaving ||
                  openrouterApiKey.trim().length < 10 ||
                  huggingfaceToken.trim().length < 10
                }
              >
                {isSaving ? "Saving..." : "Save keys"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-10"
                render={<Link to="/">Back home</Link>}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
