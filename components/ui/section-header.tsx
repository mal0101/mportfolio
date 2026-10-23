import { RegRow } from "@/components/ui/reg-marks"

export function SectionHeader({
  id,
  label,
  title,
  count,
  countLabel = "entries",
  lede,
}: {
  id: string
  label: string
  title: string
  count?: number
  countLabel?: string
  lede?: string
}) {
  // The last word is bound to the full stop (and count) so the square never starts a line on its own.
  const cut = title.lastIndexOf(" ") + 1
  const head = title.slice(0, cut)
  const last = title.slice(cut)
  return (
    <div className="section-head">
      <RegRow />
      <p className="eyebrow t-label mt-8">
        <span className="sq" aria-hidden="true" />
        {label}
      </p>
      <h2 id={`${id}-title`} tabIndex={-1} className="t-display-l mt-5" data-reveal="head">
        <span className="head-text">
          {head}
          <span className="whitespace-nowrap">
            {last}
            <span className="full-stop" aria-hidden="true" />
            {count !== undefined && (
              <sup className="count">
                {String(count).padStart(2, "0")}
                <span className="sr-only"> {countLabel}</span>
              </sup>
            )}
          </span>
        </span>
      </h2>
      {lede && <p className="t-lead mt-6">{lede}</p>}
    </div>
  )
}
