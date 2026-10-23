import { AxonMark } from "@/components/ui/axon-mark"
import { Corner, RegRow } from "@/components/ui/reg-marks"
import { ExtLink } from "@/components/ui/ext-link"
import { Pill } from "@/components/ui/pill"
import { venture } from "@/data/portfolio"

// Composed from data only; client/framework names are verbatim from the lists on axonsecurity.tech.
// CONFIRM(malak): coverage sentence wording presented as a company fact
const coverage = `Covers ${venture.coverage.clients} coding-agent clients and ${venture.coverage.frameworks} agent frameworks, from Claude Code, Cursor and Codex CLI to LangGraph, CrewAI and the Claude Agent SDK.`

export function Axon() {
  return (
    <section id="axon" data-guest="axon" aria-labelledby="axon-title" className="section">
      <div className="wrap">
        <div className="mb-10">
          <RegRow />
        </div>
        <div className="axon-panel">
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />
          <p className="eyebrow t-label">
            <span className="sq" aria-hidden="true" />
            now building
          </p>
          <h2 id="axon-title" tabIndex={-1} className="t-display-l mt-5 flex items-center gap-[.25em]">
            <AxonMark className="h-[.6em] w-[.6em] flex-none" />
            <span>
              {venture.name.slice(0, venture.name.lastIndexOf(" ") + 1)}
              <span className="whitespace-nowrap">
                {venture.name.slice(venture.name.lastIndexOf(" ") + 1)}
                <span className="full-stop" aria-hidden="true" />
              </span>
            </span>
          </h2>
          <p className="t-voice-l mt-3 text-paper">{venture.role}, with Hany El Atlassi</p>
          <p className="t-data mt-2 text-faint">{venture.period}</p>
          {/* Two balanced columns: company + programs on the left; Axon's line and its three principles on the right. */}
          <div className="grid-12 mt-12 gap-y-12">
            <div className="md:col-span-6 lg:col-span-5">
              <p className="t-lead">{venture.summary}</p>
              <p className="t-small mt-6">{coverage}</p>
              {venture.programs.map((g) => (
                <div key={g.group} className="mt-8">
                  <p className="t-label text-faint">{g.group.toLowerCase()}</p>
                  <ul className="mt-2">
                    {g.items.map((p) => (
                      <li key={p.name}>
                        <ExtLink href={p.url} className="t-small axon-link text-paper">
                          {p.name}
                        </ExtLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="t-label mt-6 text-faint">Programs as listed on axonsecurity.tech.</p>
            </div>
            <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
              <figure>
                <blockquote cite={venture.source} className="t-display-m text-paper">
                  {venture.tagline}
                </blockquote>
                <figcaption className="t-label mt-4 text-faint">from axonsecurity.tech</figcaption>
              </figure>
              <ul className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-1">
                {venture.principles.map((p) => (
                  <li key={p.title} className="axon-principle">
                    <p className="t-label text-paper">{p.title.toLowerCase()}</p>
                    <p className="t-small mt-3">{p.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12">
            <Pill href={venture.url} external>
              Visit axonsecurity.tech
            </Pill>
          </div>
        </div>
      </div>
    </section>
  )
}
