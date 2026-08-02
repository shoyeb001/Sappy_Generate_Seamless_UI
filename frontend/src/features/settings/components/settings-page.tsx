import { zodResolver } from "@hookform/resolvers/zod"
import { ShieldCheck, TriangleAlert } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router"
import {
  useGetLLMCredentialsStatusQuery,
  useSaveLLMCredentialsMutation,
} from "~/features/settings/api"
import {
  type SaveLLMCredentialsRequest,
  saveLLMCredentialsSchema,
} from "~/features/settings/types"
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

export const SettingsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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

  const form = useForm<SaveLLMCredentialsRequest>({
    resolver: zodResolver(saveLLMCredentialsSchema),
    defaultValues: { openrouter_api_key: "", huggingface_token: "" },
  })
  const { errors, isSubmitting } = form.formState

  const serverError = saveState.error ?? statusError

  const onSubmit = async (values: SaveLLMCredentialsRequest) => {
    setMessage(null)

    try {
      await saveCredentials(values).unwrap()
      form.reset()
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
      <div className="mb-5 flex items-center gap-3">
        <span className="readout text-primary">provider settings</span>
        <span className="h-px flex-1 bg-border" />
        <span className="readout">config</span>
      </div>
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.openrouter_api_key}>
                <FieldLabel htmlFor="openrouter-api-key">
                  OpenRouter API key
                </FieldLabel>
                <Input
                  id="openrouter-api-key"
                  type="password"
                  autoComplete="off"
                  placeholder="sk-or-..."
                  aria-invalid={!!errors.openrouter_api_key}
                  className="h-10"
                  {...form.register("openrouter_api_key")}
                />
                <FieldError errors={[errors.openrouter_api_key]} />
              </Field>

              <Field data-invalid={!!errors.huggingface_token}>
                <FieldLabel htmlFor="huggingface-token">
                  Hugging Face token
                </FieldLabel>
                <Input
                  id="huggingface-token"
                  type="password"
                  autoComplete="off"
                  placeholder="hf_..."
                  aria-invalid={!!errors.huggingface_token}
                  className="h-10"
                  {...form.register("huggingface_token")}
                />
                <FieldError errors={[errors.huggingface_token]} />
              </Field>

              {message ? (
                <Alert>
                  <AlertDescription className="text-foreground">
                    {message}
                  </AlertDescription>
                </Alert>
              ) : null}
              {serverError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    {parseError(
                      serverError,
                      "Unable to save provider credentials."
                    )}
                  </AlertDescription>
                </Alert>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  size="lg"
                  className="h-10"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save keys"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10"
                  render={<Link to="/">Back home</Link>}
                />
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
