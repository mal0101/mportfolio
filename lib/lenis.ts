import type Lenis from "lenis"

let instance: Lenis | null = null
export const setLenis = (l: Lenis | null) => {
  instance = l
}
export const getLenis = () => instance

/** Negative offset equal to the current nav height (56 mobile / 64 desktop). */
function navOffset(): number {
  const v = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10)
  return Number.isFinite(v) ? -v : -64
}

/** Scroll to an in-page target with Lenis when active, natively otherwise. */
export function scrollToTarget(hash: string) {
  const el = document.querySelector<HTMLElement>(hash)
  if (!el) return
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(el, { offset: navOffset() })
  else
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  history.replaceState(null, "", hash)
}
