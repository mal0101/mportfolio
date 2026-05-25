import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Experience } from "@/components/experience"
import { Works } from "@/components/works"
import { Hackathons } from "@/components/hackathons"
import { Education } from "@/components/education"
import { Skills } from "@/components/skills"
import { Leadership } from "@/components/leadership"
import { TechMarquee } from "@/components/tech-marquee"
import { Footer } from "@/components/footer"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { SectionBlend } from "@/components/section-blend"

export default function Home() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <SectionBlend />
        <About />
        <Experience />
        <Works />
        <Hackathons />
        <Education />
        <Skills />
        <Leadership />
        <TechMarquee />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
