import type { ReactNode } from "react"
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router"
import { AuthPage } from "~/features/auth/components/auth-page"
import { ProjectPage } from "~/features/generation/components/project-page"
import { LandingPage } from "~/features/landing/components/landing-page"
import { SettingsPage } from "~/features/settings/components/settings-page"
import { Footer } from "~/shared/components/layout/footer"
import { Navbar } from "~/shared/components/layout/navbar"
import { useAppSelector } from "~/shared/hooks/use-app-store"

const RootLayout = () => (
  <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
)

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const session = useAppSelector((state) => state.auth.session)
  const location = useLocation()

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/auth?next=${next}`} replace />
  }

  return children
}

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <RequireAuth>
              <ProjectPage />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  </BrowserRouter>
)
