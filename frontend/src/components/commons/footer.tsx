import { GitFork, Globe, MessageCircle, Sparkles } from "lucide-react"

const footerLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Changelog",
  "Community",
]

export const Footer = () => (
  <footer className="mt-12 border-border/60 border-t bg-background px-6 py-8">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
      <div className="text-center md:text-left">
        <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-3.5" />
          </span>
          <span className="font-semibold text-foreground text-lg">
            Sappy AI
          </span>
        </div>
        <p className="text-muted-foreground text-xs">
          © 2024 Sappy AI. Code for the future of design. All rights reserved.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-muted-foreground text-sm">
        {footerLinks.map((label) => (
          <button
            key={label}
            type="button"
            className="transition-colors hover:text-foreground"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <button
          type="button"
          aria-label="Website"
          className="rounded-md p-1.5 transition-colors hover:bg-muted hover:text-foreground"
        >
          <Globe size={18} />
        </button>
        <button
          type="button"
          aria-label="Community"
          className="rounded-md p-1.5 transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageCircle size={18} />
        </button>
        <button
          type="button"
          aria-label="Source"
          className="rounded-md p-1.5 transition-colors hover:bg-muted hover:text-foreground"
        >
          <GitFork size={18} />
        </button>
      </div>
    </div>
  </footer>
)
