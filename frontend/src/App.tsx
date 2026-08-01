import { BrowserRouter, Outlet, Route, Routes } from "react-router"
import { Footer } from "./components/commons/footer"
import { Navbar } from "./components/commons/Navbar"
import AuthPage from "./pages/auth/auth-page"
import LandingPage from "./pages/home/landing-page"
import ProjectPage from "./pages/project/project-page"
import SettingsPage from "./pages/settings/settings-page"

function RootLayout() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/project/:projectId" element={<ProjectPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
