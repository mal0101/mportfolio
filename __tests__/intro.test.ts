import { afterEach, describe, expect, it, vi } from "vitest"
import { BOOT, fibres, frontAt, INTRO, timeAt } from "@/lib/intro"

const run = () => new Function(BOOT)()
const html = document.documentElement
const setUrl = (u: string) => window.history.replaceState(null, "", u)

afterEach(() => {
  // end any run still listening, so a later test's key press is not answered by an earlier run
  window.dispatchEvent(new KeyboardEvent("keydown"))
  setUrl("/")
  vi.useRealTimers()
})

describe("boot script", () => {
  it("plays the full intro on the first view and the short one after", () => {
    run()
    expect(html.dataset.intro).toBe("full")
    delete html.dataset.intro
    run()
    expect(html.dataset.intro).toBe("short")
  })

  it("does not run under reduced motion, with ?intro=off, on deep links or off the home page", () => {
    const mm = window.matchMedia
    window.matchMedia = ((q: string) => ({ ...mm(q), matches: q.includes("reduce") })) as typeof window.matchMedia
    run()
    expect(html.dataset.intro).toBeUndefined()
    window.matchMedia = mm
    setUrl("/?intro=off")
    run()
    expect(html.dataset.intro).toBeUndefined()
    setUrl("/#y2025")
    run()
    expect(html.dataset.intro).toBeUndefined()
    setUrl("/no-such-page")
    run()
    expect(html.dataset.intro).toBeUndefined()
  })

  it("ends on the first key press and announces it", () => {
    const seen = vi.fn()
    window.addEventListener("mm:intro-end", seen)
    run()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }))
    expect(html.dataset.intro).toBe("done")
    expect(seen).toHaveBeenCalledTimes(1)
    window.removeEventListener("mm:intro-end", seen)
  })

  it("cleans itself up after the timeout", () => {
    vi.useFakeTimers()
    run()
    vi.advanceTimersByTime(INTRO.full.timeout + 1)
    expect(html.dataset.intro).toBe("done")
  })

  it("restores the UV lamp", () => {
    localStorage.setItem("mm-lamp", "on")
    run()
    expect(html.dataset.lamp).toBe("on")
  })
})

describe("timing and fibres", () => {
  it("solves the sweep easing monotonically", () => {
    expect(timeAt(0)).toBeCloseTo(0, 3)
    expect(timeAt(1)).toBeCloseTo(1, 3)
    let prev = -1
    for (let p = 0; p <= 1; p += 0.05) {
      const t = timeAt(p)
      expect(t).toBeGreaterThanOrEqual(prev)
      prev = t
    }
    expect(frontAt(1, "full")).toBe(INTRO.full.sweepAt + INTRO.full.sweep)
  })

  it("is deterministic and lights fibres in x order", () => {
    const a = fibres()
    expect(a).toEqual(fibres())
    expect(a).toHaveLength(36)
    const byX = [...a].sort((p, q) => p.x - q.x)
    for (let i = 1; i < byX.length; i++) expect(byX[i].delay).toBeGreaterThanOrEqual(byX[i - 1].delay)
    expect(new Set(a.map((f) => f.ink))).toEqual(new Set(["cyan", "magenta", "orange", "yellow"]))
  })
})
