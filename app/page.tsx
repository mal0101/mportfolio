import { Nav } from "@/components/nav"
import { Intro } from "@/components/intro"
import { Hero } from "@/components/hero"
import { Preface } from "@/components/preface"
import { ChapterSection } from "@/components/chapter"
import { Work } from "@/components/work"
import { Axon } from "@/components/axon"
import { Toolkit } from "@/components/toolkit"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { GridOverlay } from "@/components/ui/grid-overlay"
import { SmoothScroll } from "@/components/smooth-scroll"
import { PageObservers } from "@/components/page-observers"
import { buildChapters } from "@/lib/story"

const story = buildChapters()

export default function Home() {
  return (
    <>
      <Intro />
      <GridOverlay />
      <Nav />
      <main id="main" tabIndex={-1} className="relative z-[1] outline-none">
        <div id="nav-sentinel" aria-hidden="true" className="absolute top-0 left-0 h-px w-px" />
        <Hero />
        <Preface chapters={story} />
        {story.map((c) => (
          <ChapterSection key={c.id} chapter={c} />
        ))}
        <Work />
        <Axon />
        <Toolkit />
        <Contact />
      </main>
      <Footer />
      <SmoothScroll />
      <PageObservers />
    </>
  )
}
