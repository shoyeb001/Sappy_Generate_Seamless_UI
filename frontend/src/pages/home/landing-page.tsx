import { CtaSection } from "./components/cta-section"
import { GallerySection } from "./components/galary-section"
import { HeroSection } from "./components/hero-section"
import { WorkflowSection } from "./components/workflow-section"

const LandingPage = () => {
  return (
    <>
      <HeroSection />
      <WorkflowSection />
      <GallerySection />
      <CtaSection />
    </>
  )
}

export default LandingPage
