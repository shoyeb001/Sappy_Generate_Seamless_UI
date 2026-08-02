const footerLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Changelog",
  "Community",
]

export const Footer = () => (
  <footer className="mt-12 border-border border-t bg-background px-6 py-8">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
      <div className="text-center md:text-left">
        <div className="mb-1 flex items-baseline justify-center gap-2 md:justify-start">
          <span className="font-semibold text-foreground tracking-tight">
            Sappy
          </span>
          <span className="readout text-muted-foreground">/draft</span>
        </div>
        <p className="readout text-muted-foreground normal-case tracking-normal">
          © {new Date().getFullYear()} Sappy · sentence in, screen flow out
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
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
    </div>
  </footer>
)
