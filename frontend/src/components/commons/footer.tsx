import { Globe, Share2 } from "lucide-react"

export const Footer = () => (
  <footer className="mt-12 border-slate-800/60 border-t bg-[#0B0F19] px-6 py-8">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
      <div>
        <div className="mb-1 font-bold text-white text-xl">Aether UI</div>
        <p className="text-slate-500 text-xs">
          © 2024 Aether AI. Code for the future of design. All rights reserved.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-slate-400 text-sm">
        <a href="#" className="transition hover:text-white">
          Privacy Policy
        </a>
        <a href="#" className="transition hover:text-white">
          Terms of Service
        </a>
        <a href="#" className="transition hover:text-white">
          Changelog
        </a>
        <a href="#" className="transition hover:text-white">
          Community
        </a>
      </div>
      <div className="flex items-center gap-4 text-slate-400">
        <button className="transition hover:text-white">
          <Globe size={18} />
        </button>
        <button className="transition hover:text-white">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  </footer>
)
