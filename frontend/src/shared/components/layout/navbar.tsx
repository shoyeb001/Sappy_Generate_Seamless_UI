import { Sparkles } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { authSessionCleared } from "~/features/auth/slice"
import { ModeToggle } from "~/shared/components/theme/mode-toggle"
import { Button } from "~/shared/components/ui/button"
import { useAppDispatch, useAppSelector } from "~/shared/hooks/use-app-store"

export const Navbar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const session = useAppSelector((state) => state.auth.session)

  const handleAuthAction = () => {
    if (session) {
      dispatch(authSessionCleared())
      navigate("/")
      return
    }

    navigate("/auth")
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-border/60 border-b bg-background/80 px-6 py-3 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
            <Sparkles className="size-3.5" />
          </span>
          <span className="font-semibold text-foreground tracking-tight">
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
        <Button variant="outline" size="sm" onClick={handleAuthAction}>
          {session ? "Log out" : "Log in"}
        </Button>
      </div>
    </nav>
  )
}
