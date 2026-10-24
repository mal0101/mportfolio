import Image from "next/image"
import { AxonMark } from "@/components/ui/axon-mark"
import { Corner, RegRow } from "@/components/ui/reg-marks"
import { Pill } from "@/components/ui/pill"
import { venture } from "@/data/portfolio"

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
          <div className="grid-12 mt-12 gap-y-12">
            <div className="md:col-span-6 lg:col-span-5">
              <p className="t-lead">{venture.summary}</p>
              {venture.logos && venture.logos.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  {venture.logos.map((l) => (
                    <div key={l.name} className="flex items-center">
                      <Image
                        src={l.src}
                        alt={l.alt}
                        width={200}
                        height={l.height ?? 20}
                        style={{ height: l.height ?? 20, width: "auto" }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
              <figure>
                <blockquote cite={venture.source} className="t-display-m text-paper">
                  {venture.tagline}
                </blockquote>
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
