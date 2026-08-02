import { CtaSection } from "~/features/landing/components/cta-section"
import { GallerySection } from "~/features/landing/components/gallery-section"
import { HeroSection } from "~/features/landing/components/hero-section"
import { WorkflowSection } from "~/features/landing/components/workflow-section"

export const LandingPage = () => {
  return (
    <>
      <HeroSection />
      <WorkflowSection />
      <GallerySection />
      <CtaSection />
    </>
  )
}
