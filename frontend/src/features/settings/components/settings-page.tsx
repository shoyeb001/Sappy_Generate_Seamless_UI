import { KeyRound, ShieldCheck, TriangleAlert } from "lucide-react"
import { type FormEvent, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import {
  useGetLLMCredentialsStatusQuery,
  useSaveLLMCredentialsMutation,
} from "~/features/settings/api"
import { Alert, AlertDescription } from "~/shared/components/ui/alert"
import { Badge } from "~/shared/components/ui/badge"
import { Button } from "~/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card"
import { Input } from "~/shared/components/ui/input"
import { Label } from "~/shared/components/ui/label"
import { parseError } from "~/shared/lib/parse-error"

export const SettingsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [openrouterApiKey, setOpenrouterApiKey] = useState("")
  const [huggingfaceToken, setHuggingfaceToken] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  const nextPathParam = searchParams.get("next")
  const nextPath = nextPathParam?.startsWith("/") ? nextPathParam : "/"
  const isRequired = searchParams.get("required") === "1"

  const {
    data: status,
    isLoading,
    error: statusError,
  } = useGetLLMCredentialsStatusQuery()
  const [saveCredentials, saveState] = useSaveLLMCredentialsMutation()

  const error = saveState.error ?? statusError

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)

    try {
      await saveCredentials({
        openrouter_api_key: openrouterApiKey.trim(),
        huggingface_token: huggingfaceToken.trim(),
      }).unwrap()
      setOpenrouterApiKey("")
      setHuggingfaceToken("")
      setMessage("Provider keys saved.")

      if (isRequired) {
        navigate(nextPath)
      }
    } catch {
      // saveState.error renders below.
    }
  }

  return (
    <section className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center px-6 py-16">
      <Badge variant="outline" className="mb-5 w-fit gap-2 font-normal">
        <KeyRound className="size-3" />
        Provider settings
      </Badge>
      <h1 className="font-semibold text-2xl text-foreground tracking-tight">
        Connect your AI keys
      </h1>
      <p className="mt-3 max-w-lg text-muted-foreground text-sm leading-6">
        Add your OpenRouter API key and Hugging Face token. They are encrypted
        before being stored in Postgres.
      </p>

      {isRequired ? (
        <Alert className="mt-6">
          <TriangleAlert />
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
              <Alert>
                <AlertDescription className="text-foreground">
                  {message}
                </AlertDescription>
              </Alert>
            ) : null}
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {parseError(error, "Unable to save provider credentials.")}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                size="lg"
                className="h-10"
                disabled={
                  saveState.isLoading ||
                  openrouterApiKey.trim().length < 10 ||
                  huggingfaceToken.trim().length < 10
                }
              >
                {saveState.isLoading ? "Saving..." : "Save keys"}
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
