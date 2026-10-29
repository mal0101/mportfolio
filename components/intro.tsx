import type { CSSProperties } from "react"
import { preload } from "react-dom"
import { IntroStage } from "@/components/intro-stage"
import { photos } from "@/data/photos"
import { chapters } from "@/data/story"
import { introVars } from "@/lib/intro"

const VARS = introVars()
const ROOT_VARS = `:root{${Object.entries(VARS)
  .map(([k, v]) => `${k}:${v}`)
  .join(";")}}`

/**
 * The opening overlay, "Exposure" (DESIGN §6.1). Server-rendered and hidden by an inline style; only
 * html[data-intro="full|short"] (set by the boot script in app/layout.tsx) shows it, so visitors without JS or CSS never
 * see it. The year reel is pure CSS (timings from INTRO, as custom properties), the canvas is driven by <IntroStage>.
 * Purely decorative: aria-hidden, pointer-events: none, nothing focusable. The page underneath is fully rendered.
 */
export function Intro() {
  preload(photos.portrait.img.src, { as: "image" }) // fetched early: the exposure flash develops this photo
  return (
    <>
      <style>{ROOT_VARS}</style>
      <div className="intro" aria-hidden="true" style={{ display: "none", ...(VARS as CSSProperties) }}>
        <canvas className="intro-canvas" />
        {/* CONFIRM(malak): intro copy */}
        <p className="intro-top">
          <span>mmalak.dev</span>
          <span>uv lamp · 365 nm</span>
        </p>
        <div className="intro-reel">
          <div className="intro-slot">
            {chapters.map((c, i) => (
              <p key={c.id} className={`intro-yr intro-yr-${c.ink}`} style={{ "--k": i } as CSSProperties}>
                <span className="intro-num">{c.from}</span>
                <span className="intro-cap">{c.title}</span>
              </p>
            ))}
            <p className="intro-yr intro-yr-now" style={{ "--k": chapters.length } as CSSProperties}>
              <span className="intro-num">now</span>
              <span className="intro-cap">still developing</span>
            </p>
          </div>
        </div>
        <span className="intro-stop" />
        <IntroStage />
      </div>
    </>
  )
}
