import { Clipboard, Download, FileImage } from "lucide-react"
import { useState } from "react"
import {
  copyScreenHtml,
  exportScreenImage,
} from "~/features/generation/lib/export"
import type { GeneratedScreen } from "~/features/generation/types"
import { Button } from "~/shared/components/ui/button"
import { parseError } from "~/shared/lib/parse-error"

export const ExportControls = ({ screen }: { screen: GeneratedScreen }) => {
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCopyHtml = async () => {
    setError(null)
    await copyScreenHtml(screen)
    setStatus("HTML copied")
  }

  const handleExportImage = async (format: "png" | "jpg") => {
    setError(null)
    setStatus(`Exporting ${format.toUpperCase()}...`)

    try {
      await exportScreenImage(screen, format)
      setStatus(`${format.toUpperCase()} exported`)
    } catch (caughtError) {
      setError(parseError(caughtError, "Unable to export the selected frame."))
      setStatus(null)
    }
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleCopyHtml()}
          className="h-9"
        >
          <Clipboard className="size-3.5" />
          HTML
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleExportImage("png")}
          className="h-9"
        >
          <FileImage className="size-3.5" />
          PNG
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleExportImage("jpg")}
          className="h-9"
        >
          <Download className="size-3.5" />
          JPG
        </Button>
      </div>
      {status ? <p className="mt-3 text-primary text-sm">{status}</p> : null}
      {error ? <p className="mt-3 text-destructive text-sm">{error}</p> : null}
    </>
  )
}
