import { afterEach, describe, expect, it, vi } from "vitest"
import {
  BOOT,
  easeAt,
  easeFlight,
  INTRO,
  introClock,
  introVars,
  particleAt,
  tintAt,
  TINT_IN,
  type Particle,
} from "@/lib/intro"

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

  it("ends through window.__mmIntro.end and announces it once", () => {
    const seen = vi.fn()
    window.addEventListener("mm:intro-end", seen)
    run()
    const boot = (window as Window & { __mmIntro?: { end: () => void; mode: string } }).__mmIntro!
    expect(boot.mode).toBe("full")
    boot.end()
    boot.end()
    expect(html.dataset.intro).toBe("done")
    expect(seen).toHaveBeenCalledTimes(1)
    window.removeEventListener("mm:intro-end", seen)
  })

  it("times out at INTRO's full and short timeouts", () => {
    vi.useFakeTimers()
    run()
    vi.advanceTimersByTime(INTRO.full.timeout - 1)
    expect(html.dataset.intro).toBe("full")
    vi.advanceTimersByTime(2)
    expect(html.dataset.intro).toBe("done")
    delete html.dataset.intro
    run() // second view in the session
    vi.advanceTimersByTime(INTRO.short.timeout - 1)
    expect(html.dataset.intro).toBe("short")
    vi.advanceTimersByTime(2)
    expect(html.dataset.intro).toBe("done")
  })

  it("outlasts its own hand-off, so the overlay is never cut mid-flight", () => {
    for (const m of [INTRO.full, INTRO.short]) {
      expect(m.timeout).toBeGreaterThanOrEqual(m.collapse + m.collapseDur + 200)
      expect(m.collapseDur).toBeLessThanOrEqual(700) // a quick hand-off, not a long cover
    }
  })

  it("forces the mode with ?intro=full|short", () => {
    sessionStorage.setItem("mm-intro", "1")
    setUrl("/?intro=full")
    run()
    expect(html.dataset.intro).toBe("full")
    delete html.dataset.intro
    sessionStorage.clear()
    setUrl("/?intro=short")
    run()
    expect(html.dataset.intro).toBe("short")
  })

  it("skips on back/forward navigation", () => {
    const get = performance.getEntriesByType.bind(performance)
    vi.spyOn(performance, "getEntriesByType").mockImplementation(((t: string) =>
      t === "navigation" ? [{ type: "back_forward" }] : get(t)) as typeof performance.getEntriesByType)
    run()
    expect(html.dataset.intro).toBeUndefined()
    vi.restoreAllMocks()
  })

  it("restores the UV lamp", () => {
    localStorage.setItem("mm-lamp", "on")
    run()
    expect(html.dataset.lamp).toBe("on")
  })
})

describe("Exposure helpers", () => {
  it("writes every timing as a CSS custom property", () => {
    const v = introVars()
    expect(v["--i-reel"]).toBe(`${INTRO.full.reel}ms`)
    expect(v["--i-collapse"]).toBe(`${INTRO.full.collapse}ms`)
    expect(v["--i-s-collapse"]).toBe(`${INTRO.short.collapse}ms`)
  })

  it("flies a particle to its target and keeps it there", () => {
    const p: Particle = { sx: -50, sy: 400, tx: 900, ty: 120, bend: 80, delay: 800, dur: 450 }
    expect(particleAt(p, 0)).toMatchObject({ x: -50, y: 400, k: 0 })
    const mid = particleAt(p, 1000)
    expect(mid.k).toBeGreaterThan(0)
    expect(mid.k).toBeLessThan(1)
    for (const t of [p.delay + p.dur, p.delay + p.dur + 1, 5000])
      expect(particleAt(p, t)).toEqual({ x: 900, y: 120, k: 1 })
    // no flight: lands the moment its delay passes
    expect(particleAt({ ...p, dur: 0 }, 799).k).toBe(0)
    expect(particleAt({ ...p, dur: 0 }, 800).k).toBe(1)
  })

  it("eases out monotonically from 0 to 1", () => {
    expect(easeAt(0)).toBe(0)
    expect(easeAt(1)).toBe(1)
    let prev = -1
    for (let t = 0; t <= 1; t += 0.05) {
      expect(easeAt(t)).toBeGreaterThanOrEqual(prev)
      prev = easeAt(t)
    }
    expect(easeAt(-1)).toBe(0)
    expect(easeAt(2)).toBe(1)
  })

  it("flies with soft take-off and landing (eased in and out, monotonic)", () => {
    expect(easeFlight(0)).toBe(0)
    expect(easeFlight(1)).toBe(1)
    expect(easeFlight(0.5)).toBeCloseTo(0.5, 5)
    expect(easeFlight(0.1)).toBeLessThan(0.02) // no violent first frame (the old ease-out was at 34% by here)
    expect(easeFlight(0.9)).toBeGreaterThan(0.98)
    let prev = -1
    for (let t = 0; t <= 1; t += 0.02) {
      expect(easeFlight(t)).toBeGreaterThanOrEqual(prev)
      prev = easeFlight(t)
    }
  })

  it("cross-dissolves the year ink: eases in from 0, eases out to 0, neighbours overlap", () => {
    const m = INTRO.full
    for (let i = 0; i < 5; i++) {
      const at = i < 4 ? i * m.reel : m.now
      expect(tintAt(i, at - 1)).toBe(0)
      expect(tintAt(i, at)).toBe(0) // starts from nothing: no pop
      expect(tintAt(i, at + TINT_IN)).toBeCloseTo(1, 5)
      expect(tintAt(i, at + 5000)).toBe(0)
    }
    // while 2024 is rising 2022 is still fading: both inks are present at once
    const t = m.reel + TINT_IN / 2
    expect(tintAt(0, t)).toBeGreaterThan(0.3)
    expect(tintAt(1, t)).toBeGreaterThan(0)
    // no jump anywhere on the way (max step per ms)
    let prev = tintAt(1, 0)
    for (let ms = 1; ms < 2000; ms++) {
      const v = tintAt(1, ms)
      expect(Math.abs(v - prev)).toBeLessThan(0.02)
      prev = v
    }
    expect(tintAt(1, 400, "short")).toBe(0) // the short variant has no reel and no tint
  })

  it("runs the JS off the CSS timeline's start once it is known, else the boot t0", () => {
    expect(introClock(42)).toBe(42) // no overlay
    const el = document.createElement("div")
    el.className = "intro"
    document.body.append(el)
    expect(introClock(42)).toBe(42) // jsdom: no getAnimations
    const anims = [{ startTime: null }, { startTime: 97.5 }]
    Object.assign(el, { getAnimations: () => anims })
    expect(introClock(42)).toBe(97.5)
    anims[1].startTime = null // still pending
    expect(introClock(42)).toBe(42)
    el.remove()
  })
})
