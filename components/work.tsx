import { SectionHeader } from "@/components/ui/section-header"
import { ExtLink } from "@/components/ui/ext-link"
import { TextLink } from "@/components/ui/text-link"
import { ArrowUpRight } from "@/components/ui/icons"
import { linkKind } from "@/lib/links"
import { projects } from "@/data/portfolio"

// Binds the last word to the trailing arrow so the icon never wraps onto a line by itself.
function splitLast(text: string): [string, string] {
  const cut = text.lastIndexOf(" ") + 1
  return [text.slice(0, cut), text.slice(cut)]
}

export function Work() {
  return (
    <section id="work" data-ink="uv" aria-labelledby="work-title" className="section">
      <div className="wrap">
        {/* CONFIRM(malak): workbench lede */}
        <SectionHeader
          id="work"
          label="workbench"
          title="Built end to end"
          count={projects.length}
          lede="Six projects, from a model-file X-ray to a voice-first agronomist. Three of them came out of the hackathons in chapter 4."
        />
        <div>
          {projects.map((p) => (
            <article key={p.title} className={`work-row grid-12 ${p.link ? "has-link" : ""}`}>
              <div className="md:col-span-6 lg:col-span-5">
                <h3 className="t-title work-title">
                  {p.link ? (
                    <ExtLink href={p.link}>
                      {splitLast(p.title)[0]}
                      <span className="whitespace-nowrap">
                        {splitLast(p.title)[1]}
                        <ArrowUpRight size={16} className="ml-2 inline-block align-[-0.1em]" />
                      </span>
                    </ExtLink>
                  ) : (
                    p.title
                  )}
                </h3>
                {p.badge && (
                  <p className="t-voice mt-2 flex items-baseline gap-2 text-paper">
                    <span className="sq" aria-hidden="true" />
                    {p.badge}
                  </p>
                )}
              </div>
              <p className="t-body max-w-[60ch] md:col-span-4 lg:col-span-5">{p.description}</p>
              <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-2">
                <ul aria-label="Stack" className="flex flex-wrap gap-x-4 md:block">
                  {p.tags.map((t) => (
                    <li key={t} className="t-data text-faint">
                      {t}
                    </li>
                  ))}
                </ul>
                {p.link && (
                  <TextLink href={p.link} external label={`${p.title}: ${linkKind(p.link)} (opens in a new tab)`}>
                    {linkKind(p.link)}
                  </TextLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
