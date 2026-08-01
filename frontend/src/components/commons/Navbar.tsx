import { Share2 } from "lucide-react"
import { authSessionCleared } from "@/store/auth-slice"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { Button } from "../ui/button"

export const Navbar = () => {
  const dispatch = useAppDispatch()
  const session = useAppSelector((state) => state.auth.session)

  const handleAuthAction = () => {
    if (session) {
      dispatch(authSessionCleared())
      window.location.href = "/"
      return
    }

    window.location.href = "/auth"
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-slate-800/50 border-b bg-[#0B0F19]/80 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <div className="font-bold text-white text-xl tracking-tight">
          Sappy AI
        </div>
        <div className="hidden items-center gap-6 text-slate-400 text-sm md:flex">
          {session ? (
            <a href="/settings" className="transition-colors hover:text-white">
              Settings
            </a>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* <button className="text-slate-400 hover:text-white"><RotateCcw size={18} /></button> */}
        <button className="text-slate-400 hover:text-white">
          <Share2 size={18} />
        </button>
        <div className="mx-2 h-4 w-px bg-slate-800"></div>
        <Button onClick={handleAuthAction}>
          {session ? "Log out" : "Log in"}
        </Button>
      </div>
    </nav>
  )
}
