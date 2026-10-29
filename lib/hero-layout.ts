// Hero field geometry shared by HeroField and the intro (DESIGN §5.11), so their targets coincide by construction.
import { dotPitchFor, placePortrait, portraitDots, type Box } from "@/lib/portrait"

/** Text boxes inside the hero copy, relative to the field, so the mark is placed in clear space. */
export function textBoxes(hero: HTMLElement, origin: DOMRect, pad: number): Box[] {
  const inner = hero.querySelector(".hero-inner")
  if (!inner) return []
  const out: Box[] = []
  // inset (em): a text box spans the font's whole content area (~1.4em in Hubot), well beyond the glyphs
  const add = (r: DOMRect, fs = 0) => {
    if (r.width && r.height)
      out.push({
        l: r.left - origin.left - pad,
        t: r.top + fs * 0.3 - origin.top - pad,
        r: r.right - origin.left + pad,
        b: r.bottom - fs * 0.25 - origin.top + pad,
      })
  }
  const range = document.createRange()
  const walker = document.createTreeWalker(inner, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue
    range.selectNodeContents(n)
    const fs = n.parentElement ? parseFloat(getComputedStyle(n.parentElement).fontSize) || 0 : 0
    for (const r of range.getClientRects()) add(r, fs)
  }
  inner.querySelectorAll(".pill").forEach((el) => add(el.getBoundingClientRect()))
  // The full stop is scaled around its centre by the opening (`intro-land` rests at scale(0) until the overlay clears,
  // which would collapse its rect to nothing and drop it from the boxes): take the centre from the rect and the size from
  // the layout box, so the boxes (and the portrait placed from them) do not depend on when this runs.
  inner.querySelectorAll<HTMLElement>(".full-stop").forEach((el) => {
    const r = el.getBoundingClientRect()
    const w = el.offsetWidth || r.width
    const h = el.offsetHeight || r.height
    if (!w || !h) return
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    add({ left: cx - w / 2, right: cx + w / 2, top: cy - h / 2, bottom: cy + h / 2, width: w, height: h } as DOMRect)
  })
  return out
}

/** Cell size, px. */
export const fieldPitch = (mobile: boolean) => (mobile ? 8 : 12)

/** Field pixel ratio: capped at 2 (1.5 on mobile). */
export const fieldDpr = (mobile: boolean) => Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)

/** Field size and breakpoint only: cheap enough for the no-op resize check. */
export function heroSize(wrap: HTMLElement) {
  const rect = wrap.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const h = Math.max(1, Math.round(rect.height))
  return { w, h, mobile: window.innerWidth < 768, rect }
}

/**
 * Measures the field: size, breakpoint, pitch, content edge, first free y below the nav and the copy boxes. Pass a
 * `heroSize` result to avoid measuring the box twice.
 */
export function heroLayout(hero: HTMLElement, wrap: HTMLElement, size = heroSize(wrap)) {
  const { w, mobile, rect } = size
  // The name narrows while the page scrolls (a scroll-driven animation on the h1, `name-compress`): measured scrolled
  // (a deep link, a reload mid-page) the copy boxes are narrower than at rest and the portrait would be placed for
  // them, then sit over the name when the page returns to the top. Measure the name at rest, always.
  const name = window.scrollY > 0 ? hero.querySelector<HTMLElement>(".hero-name") : null
  const kept = name?.style.animation ?? ""
  if (name) name.style.animation = "none"
  try {
    return measureLayout(hero, size, w, mobile, rect)
  } finally {
    if (name) name.style.animation = kept
  }
}

function measureLayout(
  hero: HTMLElement,
  size: ReturnType<typeof heroSize>,
  w: number,
  mobile: boolean,
  rect: DOMRect,
) {
  const inner = hero.querySelector(".hero-inner")
  const innerRect = inner?.getBoundingClientRect()
  const padR = inner ? parseFloat(getComputedStyle(inner).paddingRight) || 0 : 0
  const right = innerRect ? innerRect.right - padR - rect.left : w * 0.94
  const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 64
  return {
    ...size,
    pitch: fieldPitch(mobile),
    dpr: fieldDpr(mobile),
    top: navH + (mobile ? 20 : 36),
    right,
    boxes: textBoxes(hero, rect, mobile ? 16 : 28),
  }
}

/**
 * The portrait exactly as HeroField places it: the layout, the rect (field-relative) and the fine dot grid. The intro
 * calls this too, so its particles land on the very dots the hero draws. Null rect = no portrait fits (mark mode).
 */
export function heroPortrait(hero: HTMLElement, wrap: HTMLElement) {
  const L = heroLayout(hero, wrap)
  const rect = placePortrait(L)
  return { L, rect, dots: rect ? portraitDots(rect, dotPitchFor(L.pitch)) : null }
}
