import { AxonMark } from "@/components/ui/axon-mark"
import { Corner, RegRow } from "@/components/ui/reg-marks"
import { Pill } from "@/components/ui/pill"
import { venture } from "@/data/portfolio"

const partnerGroups = [
  { group: "backed", label: "Backed by", span: "lg:col-span-6" },
  { group: "member", label: "Member of the cybersecurity program of", span: "lg:col-span-6 lg:col-start-7" },
] as const

export function Axon() {
  const logos = venture.logos ?? []
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
          <div className="grid-12 gap-y-8">
            <div className="md:col-span-6 lg:col-span-7">
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
              <p className="t-voice-l mt-3 text-paper">
                {venture.role}, with {venture.cofounder}
              </p>
              <p className="t-data mt-2 text-faint">{venture.period}</p>
            </div>
            <figure className="md:col-span-6 lg:col-span-5 lg:self-end">
              <blockquote cite={venture.source} className="t-display-m text-paper">
                {venture.tagline}
              </blockquote>
            </figure>
          </div>
          <div className="grid-12 mt-10 gap-y-8">
            <div className="md:col-span-6 lg:col-span-5">
              <p className="t-lead">{venture.summary}</p>
            </div>
            <ul className="grid gap-6 md:col-span-6 md:grid-cols-1 lg:col-span-7 lg:grid-cols-3 lg:gap-8">
              {venture.principles.map((p) => (
                <li key={p.title} className="axon-principle">
                  <p className="t-label text-paper">{p.title.toLowerCase()}</p>
                  <p className="t-small mt-3">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
          {logos.length > 0 && (
            <div className="axon-partners grid-12 mt-10 gap-y-8">
              {partnerGroups.map(({ group, label, span }) => (
                <div key={group} className={`col-span-full ${span}`}>
                  <p id={`axon-partners-${group}`} className="t-label text-faint">
                    {label}
                  </p>
                  <ul
                    aria-labelledby={`axon-partners-${group}`}
                    className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2"
                  >
                    {logos
                      .filter((l) => l.group === group)
                      .map((l) => (
                        <li key={l.name}>
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={l.alt}
                            className="flex min-h-11 items-center"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- sanitised SVG logos, fixed intrinsic size */}
                            <img
                              src={l.src}
                              alt=""
                              width={l.width}
                              height={l.height}
                              style={{ height: l.display, width: "auto" }}
                              loading="lazy"
                              decoding="async"
                            />
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <div className="mt-8">
            <Pill href={venture.url} external>
              Visit axonsecurity.tech
            </Pill>
          </div>
        </div>
      </div>
    </section>
  )
}
