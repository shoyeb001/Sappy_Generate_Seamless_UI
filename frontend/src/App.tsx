import { Navbar } from "./components/commons/Navbar"
import { Footer } from "./components/commons/footer"
import LandingPage from "./pages/home/landing-page"
import ProjectPage from "./pages/project/project-page"
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/project/:projectId",
    element: <ProjectPage />,
  },
]);

export function App() {
  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans selection:bg-cyan-500/30">
      <Navbar />
      <main>
        <RouterProvider router={router} />
      </main>
      <Footer />
    </div>
  )
}

export default App
