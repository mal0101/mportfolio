import { SectionHeader } from "@/components/ui/section-header"
import { about, type Paragraph } from "@/data/portfolio"
import type { Ink } from "@/data/story"
import { yearsLabel, type Chapter } from "@/lib/story"

function Para({ p }: { p: Paragraph }) {
  if (!p.strong) return <>{p.text}</>
  const i = p.text.indexOf(p.strong)
  if (i === -1) return <>{p.text}</>
  return (
    <>
      {p.text.slice(0, i)}
      <strong>{p.strong}</strong>
      {p.text.slice(i + p.strong.length)}
    </>
  )
}

const AFTER: { href: string; label: string; title: string; ink: Ink }[] = [
  { href: "#work", label: "workbench", title: "Built end to end", ink: "uv" },
  { href: "#axon", label: "now", title: "Axon Security", ink: "lime" },
  { href: "#toolkit", label: "appendix", title: "The toolkit", ink: "uv" },
]

export function Preface({ chapters }: { chapters: Chapter[] }) {
  return (
    <section id="preface" data-ink="uv" aria-labelledby="preface" className="section">
      <div className="wrap">
        {/* CONFIRM(malak): preface title */}
        <SectionHeader id="preface" label="preface" title="Notes" />
        <div className="grid-12 gap-y-14">
          <div className="md:col-span-6 lg:col-span-6">
            {about.map((p, i) => (
              <p key={i} className={i === 0 ? "t-lead text-paper" : "t-body mt-6"}>
                <Para p={p} />
              </p>
            ))}
          </div>
          <nav aria-label="Index" className="md:col-span-6 lg:col-span-5 lg:col-start-8">
            <p className="t-label text-faint">index</p>
            <ol className="mt-3">
              {chapters.map((c) => (
                <li key={c.id} data-ink={c.ink}>
                  <a href={`#${c.id}`} className="contents-row">
                    <span className="t-data text-faint">{c.n}</span>
                    <span className="t-data text-paper">
                      <span className="sq" aria-hidden="true" />
                      {yearsLabel(c)}
                    </span>
                    <span className="contents-title">{c.title}</span>
                  </a>
                </li>
              ))}
              {AFTER.map((r) => (
                <li key={r.href} data-ink={r.ink}>
                  <a href={r.href} className="contents-row">
                    <span aria-hidden="true" />
                    <span className="t-data text-paper">
                      <span className="sq" aria-hidden="true" />
                      {r.label}
                    </span>
                    <span className="contents-title">{r.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  )
}
