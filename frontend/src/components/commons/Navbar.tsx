import { Sparkles } from "lucide-react"
import { Link } from "react-router"
import { authSessionCleared } from "~/store/auth-slice"
import { useAppDispatch, useAppSelector } from "~/store/store"
import { Button } from "../ui/button"
import { ModeToggle } from "./mode-toggle"

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
    <nav className="sticky top-0 z-50 flex items-center justify-between border-border/60 border-b bg-background/80 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-semibold text-foreground text-lg tracking-tight">
            Sappy AI
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-muted-foreground text-sm md:flex">
          {session ? (
            <Link
              to="/settings"
              className="transition-colors hover:text-foreground"
            >
              Settings
            </Link>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <div className="mx-1 h-4 w-px bg-border" />
        <Button variant="outline" size="lg" onClick={handleAuthAction}>
          {session ? "Log out" : "Log in"}
        </Button>
      </div>
    </nav>
  )
}
