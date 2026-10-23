import { SectionHeader } from "@/components/ui/section-header"
import { concepts, skillCategories, techItems } from "@/data/portfolio"

const az = (a: string, b: string) => a.localeCompare(b, "en")

export function Toolkit() {
  return (
    <section id="toolkit" data-ink="uv" aria-labelledby="toolkit-title" className="section">
      <div className="wrap">
        <SectionHeader id="toolkit" label="appendix" title="The toolkit" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:gap-x-10 lg:grid-cols-4">
          {skillCategories.map((c) => (
            <div key={c.category}>
              <h3 className="t-label text-paper">{c.category}</h3>
              <ul className="mt-4">
                {c.skills.map((s) => (
                  <li key={s} className="t-small border-t border-hairline-2 py-2">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="grid-12 mt-16 gap-y-3">
          <p className="t-label text-faint md:col-span-1 lg:col-span-3">index</p>
          <div className="md:col-span-5 lg:col-span-9">
            <p className="index-line t-small">
              <span className="text-paper">Concepts: </span>
              {[...concepts].sort(az).join(", ")}
            </p>
            <p className="index-line t-small mt-2">
              <span className="text-paper">Tools: </span>
              {[...techItems].sort(az).join(", ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
