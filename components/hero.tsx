import { HeroField } from "@/components/hero-field"
import { Pill } from "@/components/ui/pill"
import { TextLink } from "@/components/ui/text-link"
import { personalInfo, venture } from "@/data/portfolio"

export function Hero() {
  return (
    <section id="top" aria-label="Introduction" data-ink="uv" className="hero">
      <HeroField />
      <div className="wrap hero-inner">
        <div className="hero-id">
          <div>
            <p className="t-voice-l text-paper">
              Co-founder &amp; co-CEO,{" "}
              <a href="#axon" className="hero-role-link">
                Axon Security
              </a>
            </p>
            <p className="t-label mt-2 text-faint">based in {personalInfo.location.toLowerCase()}</p>
          </div>
        </div>
        <h1 className="t-display-xl hero-name mt-6">
          <span className="hero-line block whitespace-nowrap">{personalInfo.firstName}</span>{" "}
          <span className="hero-line block whitespace-nowrap">
            {personalInfo.lastName}
            <span className="full-stop" aria-hidden="true" />
          </span>
        </h1>
        <div className="hero-rule" aria-hidden="true" />
        <div className="grid-12 items-end">
          {/* CONFIRM(malak): hero lead wording */}
          <p className="t-lead md:col-span-6 lg:col-span-6">
            Co-founder and co-CEO of Axon Security, where we build agent security for the AI stack you already run.
            I&apos;m an AI &amp; software engineer building production ML systems, from research to deployment.
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:col-span-6 lg:col-span-5 lg:col-start-8 lg:justify-end">
            <Pill href={`mailto:${personalInfo.email}`}>Email me</Pill>
            <TextLink href={venture.url} external>
              axonsecurity.tech
            </TextLink>
          </div>
        </div>
        <p className="t-voice mt-8 max-w-[60ch] text-faint">
          <span className="cap-fine">Move your cursor across the field.</span>
          <span className="cap-touch">Tap the field.</span>
        </p>
      </div>
    </section>
  )
}
