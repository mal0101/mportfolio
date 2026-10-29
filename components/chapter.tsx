import type React from "react"
import { Corner, RegRow } from "@/components/ui/reg-marks"
import { Photo } from "@/components/photo"
import { shortPlacement } from "@/lib/placement"
import { yearsLabel, type Chapter, type Entry } from "@/lib/story"
import { photos, type PhotoId } from "@/data/photos"

const SIZES = {
  one: "(min-width: 1024px) 28vw, (min-width: 768px) 92vw, calc(100vw - 40px)",
  lead: "(min-width: 1024px) 26vw, (min-width: 768px) 40vw, calc(100vw - 40px)",
  rest: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, calc(100vw - 40px)",
}

// "internship" | "freelance" for roles; "school" | "community" otherwise (hackathons show their placement instead).
const kindLabel = (e: Entry): string => (e.kind === "role" ? e.item.type : e.kind)

// Sets only the quoted paper title (with its quotes) in the italic voice; the rest of the detail is unchanged.
function Detail({ text }: { text: string }) {
  const m = text.match(/"(.+)"/)
  if (!m || m.index === undefined) return <>{text}</>
  return (
    <>
      {text.slice(0, m.index)}
      <span className="t-voice text-paper">{m[0]}</span>
      {text.slice(m.index + m[0].length)}
    </>
  )
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  if (!items.length) return null
  return (
    <ul className="mt-4 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="t-body flex gap-3">
          <span className="bullet" aria-hidden="true" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

function Fig({ id, sizes, framed }: { id: PhotoId; sizes: string; framed?: boolean }) {
  const p = photos[id]
  return (
    <figure>
      <div className="fig-frame">
        {framed && (
          <>
            <Corner position="tl" />
            <Corner position="tr" />
            <Corner position="bl" />
            <Corner position="br" />
          </>
        )}
        <Photo img={p.img} alt={p.alt} sizes={sizes} />
      </div>
      {p.caption && <figcaption className="fig-cap t-voice mt-3 text-faint">{p.caption}</figcaption>}
    </figure>
  )
}

function When({ e }: { e: Entry }) {
  if (e.kind === "hackathon")
    return (
      <>
        <p className="t-placement" aria-hidden="true">
          {shortPlacement(e.item.placement)}
        </p>
        <p className="t-label mt-4 text-faint">{e.item.placement}</p>
        {e.note?.when && <p className="t-data mt-1 text-paper">{e.note.when}</p>}
      </>
    )
  const period = e.item.period
  const where = e.kind === "role" ? e.item.location : undefined
  return (
    <>
      <p className="t-data text-paper">{period}</p>
      <p className="t-label mt-1 text-faint">{kindLabel(e)}</p>
      {where && <p className="t-label text-faint">{where}</p>}
    </>
  )
}

function Body({ e }: { e: Entry }) {
  switch (e.kind) {
    case "school":
      return (
        <>
          <h3 className="t-title">{e.item.degree}</h3>
          <p className="t-voice mt-1 text-ghost">{e.item.school}</p>
          <Bullets
            items={e.item.details.map((d) => (
              <Detail key={d} text={d} />
            ))}
          />
        </>
      )
    case "role":
      return (
        <>
          <h3 className="t-title">{e.item.role}</h3>
          <p className="t-voice mt-1 text-ghost">{e.item.company}</p>
          <Bullets items={e.item.highlights} />
        </>
      )
    case "community":
      return (
        <>
          <h3 className="t-title">{e.item.role}</h3>
          <p className="t-voice mt-1 text-ghost">{e.item.organization}</p>
          {e.item.description && <p className="t-body mt-3">{e.item.description}</p>}
        </>
      )
    case "hackathon":
      return (
        <>
          <h3 className="t-title">{e.item.name}</h3>
          <p className="t-voice mt-1 text-paper">{e.item.project}</p>
          <p className="t-body mt-3">{e.item.detail}</p>
          {e.item.organizers && <p className="t-label mt-3 text-faint">{e.item.organizers}</p>}
        </>
      )
  }
}

function EntryRow({ e }: { e: Entry }) {
  const figures: PhotoId[] = e.note?.figures ?? []
  const quote = e.note?.quote
  return (
    <li className="entry">
      <article className="grid-12">
        <div className="entry-when md:col-span-2 lg:col-span-3">
          <When e={e} />
        </div>
        <div className="md:col-span-4 lg:col-span-5">
          <Body e={e} />
          {e.note?.team && <p className="t-small mt-3 text-paper">{e.note.team}</p>}
          {e.note?.extra && <p className="t-small mt-1">{e.note.extra}</p>}
          {quote && (
            <figure className="entry-quote">
              <blockquote className="t-voice-l text-paper">“{quote}”</blockquote>
              {/* CONFIRM(malak): attribution line for her own LinkedIn sentences */}
              <figcaption className="t-label mt-2 text-faint">on LinkedIn</figcaption>
            </figure>
          )}
          {e.note?.aside && <p className="t-voice mt-4 text-faint">{e.note.aside}</p>}
        </div>
        {figures.length === 1 && (
          <div className="md:col-span-4 md:col-start-3 lg:col-span-4 lg:col-start-9">
            <Fig id={figures[0]} sizes={SIZES.one} />
          </div>
        )}
        {figures.length > 1 && (
          <div className="exhibit md:col-span-4 md:col-start-3 lg:col-span-9 lg:col-start-4">
            <div>
              <Fig id={figures[0]} sizes={SIZES.lead} framed />
            </div>
            <div className="exhibit-rest">
              {figures.slice(1).map((id) => (
                <Fig key={id} id={id} sizes={SIZES.rest} />
              ))}
            </div>
          </div>
        )}
      </article>
    </li>
  )
}

export function ChapterSection({ chapter: c }: { chapter: Chapter }) {
  const cut = c.title.lastIndexOf(" ") + 1
  return (
    <section id={c.id} data-ink={c.ink} aria-labelledby={`${c.id}-title`} className="section chapter">
      <div className="wrap">
        <RegRow />
        <header className="chapter-head grid-12">
          <p className="chapter-year md:col-span-6 lg:col-span-7" aria-hidden="true">
            {c.from}
            {c.to !== c.from && <span className="chapter-to t-data">to {c.to}</span>}
          </p>
          <div className="md:col-span-5 lg:col-span-5">
            <p className="eyebrow t-label">
              <span className="sq" aria-hidden="true" />
              chapter {c.n}
            </p>
            <h2 id={`${c.id}-title`} tabIndex={-1} className="t-display-m mt-4 [text-wrap:balance]" data-reveal="head">
              <span className="head-text">
                {/* the space sits outside the sr-only span: a trailing space inside it is dropped from the accessible name */}
                <span className="sr-only">{yearsLabel(c)}:</span> {c.title.slice(0, cut)}
                <span className="whitespace-nowrap">
                  {c.title.slice(cut)}
                  <span className="full-stop" aria-hidden="true" />
                </span>
              </span>
            </h2>
            <p className="t-lead mt-5">{c.lede}</p>
          </div>
        </header>
        <ol className="timeline">
          {c.entries.map((e) => (
            <EntryRow key={e.key} e={e} />
          ))}
        </ol>
      </div>
    </section>
  )
}
