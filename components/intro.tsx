import { fibres } from "@/lib/intro"

const FIBRES = fibres()

/**
 * The opening overlay (DESIGN §3). Server-rendered and hidden by an inline style; only html[data-intro="full|short"]
 * (set by the boot script in app/layout.tsx) shows it, so visitors without JS or CSS never see it. Purely decorative:
 * aria-hidden, pointer-events: none, nothing focusable. The page underneath is fully rendered and painted.
 */
export function Intro() {
  return (
    <div className="intro" aria-hidden="true" style={{ display: "none" }}>
      <div className="intro-ground">
        <div className="intro-trail" />
        <div className="intro-ink" />
        <div className="intro-torch" />
        {/* CONFIRM(malak): torch tag (UV security lamps run at 365 nm) */}
        <p className="intro-tag">uv 365 nm</p>
      </div>
      <svg className="intro-fibres" viewBox="0 0 1000 1000" preserveAspectRatio="none" focusable="false">
        {FIBRES.map((f, i) => (
          <path
            key={i}
            d={f.d}
            vectorEffect="non-scaling-stroke"
            className={`intro-fibre fibre-${f.ink}`}
            style={{ animationDelay: `${f.delay}ms` }}
          />
        ))}
      </svg>
    </div>
  )
}
