import { toJpeg, toPng } from "html-to-image"
import type { GeneratedScreen } from "~/features/generation/types"

export function getExportFileName(
  screen: GeneratedScreen,
  format: "png" | "jpg"
) {
  const slug = screen.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  return `${slug || screen.id}.${format}`
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const anchor = document.createElement("a")
  anchor.href = dataUrl
  anchor.download = fileName
  anchor.click()
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function createExportFrame(screen: GeneratedScreen) {
  const frame = document.createElement("iframe")

  frame.style.position = "fixed"
  frame.style.left = "-10000px"
  frame.style.top = "0"
  frame.style.width = `${screen.width}px`
  frame.style.height = `${screen.height}px`
  frame.style.overflow = "hidden"
  frame.style.border = "0"
  frame.setAttribute("aria-hidden", "true")

  document.body.appendChild(frame)
  frame.srcdoc = screen.html

  return frame
}

function waitForExportFrame(
  frame: HTMLIFrameElement,
  screen: GeneratedScreen,
  timeoutMs = 5000
) {
  return new Promise<void>((resolve) => {
    const markReady = () => {
      const frameDocument = frame.contentDocument

      if (frameDocument) {
        frameDocument.documentElement.style.width = `${screen.width}px`
        frameDocument.documentElement.style.minHeight = `${screen.height}px`
        frameDocument.body.style.width = `${screen.width}px`
        frameDocument.body.style.minHeight = `${screen.height}px`
        frameDocument.body.style.margin = "0"
      }

      window.clearTimeout(timeoutId)
      window.setTimeout(resolve, 800)
    }

    const timeoutId = window.setTimeout(markReady, timeoutMs)

    if (frame.contentDocument?.readyState === "complete") {
      markReady()
      return
    }

    frame.addEventListener("load", markReady, { once: true })
  })
}

function getExportRoot(frame: HTMLIFrameElement) {
  const root = frame.contentDocument?.body

  if (!root) {
    throw new Error("Unable to prepare the selected frame for export.")
  }

  return root
}

/** Copies the screen's HTML to the clipboard, with a textarea fallback. */
export async function copyScreenHtml(screen: GeneratedScreen) {
  try {
    await navigator.clipboard.writeText(screen.html)
  } catch {
    const textArea = document.createElement("textarea")
    textArea.value = screen.html
    textArea.style.position = "fixed"
    textArea.style.left = "-9999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    document.execCommand("copy")
    textArea.remove()
  }
}

/**
 * Renders the screen's HTML into a hidden, correctly-sized iframe and exports
 * it as a PNG or JPG download.
 */
export async function exportScreenImage(
  screen: GeneratedScreen,
  format: "png" | "jpg"
) {
  const frame = createExportFrame(screen)

  try {
    await waitForExportFrame(frame, screen)
    await wait(1200)
    const root = getExportRoot(frame)

    const options = {
      backgroundColor: "#ffffff",
      cacheBust: true,
      canvasHeight: screen.height,
      canvasWidth: screen.width,
      height: screen.height,
      pixelRatio: 1,
      skipFonts: true,
      width: screen.width,
    }

    const dataUrl =
      format === "png"
        ? await toPng(root, options)
        : await toJpeg(root, { ...options, quality: 0.95 })

    downloadDataUrl(dataUrl, getExportFileName(screen, format))
  } finally {
    frame.remove()
  }
}
