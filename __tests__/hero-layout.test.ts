import { afterAll, afterEach, describe, expect, it, vi } from "vitest"
import { heroLayout, textBoxes } from "@/lib/hero-layout"

// jsdom has no layout: give elements the rects a browser would report.
const rect = (l: number, t: number, w: number, h: number) =>
  ({ left: l, top: t, right: l + w, bottom: t + h, width: w, height: h, x: l, y: t, toJSON() {} }) as DOMRect

function hero() {
  document.body.innerHTML = `<section class="hero"><div class="hero-field"></div><div class="hero-inner">
    <h1 class="hero-name"><span class="hero-line">Malak</span><span class="hero-line">Mekyassi.<span class="full-stop"></span></span></h1></div></section>`
  const section = document.querySelector<HTMLElement>(".hero")!
  const wrap = document.querySelector<HTMLElement>(".hero-field")!
  const stop = document.querySelector<HTMLElement>(".full-stop")!
  const name = document.querySelector<HTMLElement>(".hero-name")!
  return { section, wrap, stop, name }
}

// no text layout in jsdom: the text nodes contribute no rects, only the stop does
const rects = Range.prototype.getClientRects
Range.prototype.getClientRects = () => [] as unknown as DOMRectList

afterEach(() => {
  document.body.innerHTML = ""
  vi.unstubAllGlobals()
})

describe("hero layout (the portrait's inputs)", () => {
  it("keeps the full stop's box while the opening holds it at scale(0)", () => {
    const { section, stop } = hero()
    Object.defineProperty(stop, "offsetWidth", { value: 32 })
    Object.defineProperty(stop, "offsetHeight", { value: 32 })
    const origin = rect(0, 0, 1000, 800)
    // at rest the stop is 32px square at (500, 400); scaled to nothing it is a zero rect at the same centre
    stop.getBoundingClientRect = () => rect(500, 400, 32, 32)
    const rest = textBoxes(section, origin, 28)
    stop.getBoundingClientRect = () => rect(516, 416, 0, 0)
    const held = textBoxes(section, origin, 28)
    expect(rest).toHaveLength(1)
    expect(held).toEqual(rest)
  })

  it("measures the name at rest when the page is scrolled, and puts its animation back", () => {
    const { section, wrap, name } = hero()
    wrap.getBoundingClientRect = () => rect(0, 0, 1000, 800)
    vi.stubGlobal("scrollY", 400)
    const seen: string[] = []
    section.querySelector(".hero-inner")!.getBoundingClientRect = () => {
      seen.push(name.style.animation)
      return rect(0, 0, 1000, 800)
    }
    name.style.animation = "name-compress 1s"
    heroLayout(section, wrap)
    expect(seen).toEqual(["none"])
    expect(name.style.animation).toContain("name-compress")
  })

  it("leaves the name's animation alone at the top of the page", () => {
    const { section, wrap, name } = hero()
    wrap.getBoundingClientRect = () => rect(0, 0, 1000, 800)
    vi.stubGlobal("scrollY", 0)
    const seen: string[] = []
    section.querySelector(".hero-inner")!.getBoundingClientRect = () => {
      seen.push(name.style.animation)
      return rect(0, 0, 1000, 800)
    }
    name.style.animation = "name-compress 1s"
    heroLayout(section, wrap)
    expect(seen[0]).toContain("name-compress")
  })
})

afterAll(() => {
  Range.prototype.getClientRects = rects
})
