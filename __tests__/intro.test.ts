import { afterEach, describe, expect, it, vi } from "vitest"
import {
  BOOT,
  READY,
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
type Boot = {
  mode: string
  t0: number
  tGo: number
  aborted: number
  end: () => void
  go: (m?: string) => string
  plan: () => string
}
const boot = () => (window as Window & { __mmIntro?: Boot }).__mmIntro!
const html = document.documentElement
const setUrl = (u: string) => window.history.replaceState(null, "", u)

afterEach(() => {
  // end any run still listening, so a later test's key press is not answered by an earlier run
  window.dispatchEvent(new KeyboardEvent("keydown"))
  setUrl("/")
  vi.useRealTimers()
  delete html.dataset.intro
  delete html.dataset.introGo
})

describe("boot script", () => {
  it("plays the full intro on the first view and the short one after", () => {
    sessionStorage.clear()
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

  it("times out at INTRO's full and short timeouts, counted from go", () => {
    vi.useFakeTimers()
    run()
    boot().go()
    vi.advanceTimersByTime(INTRO.full.timeout - 1)
    expect(html.dataset.intro).toBe("full")
    vi.advanceTimersByTime(2)
    expect(html.dataset.intro).toBe("done")
    delete html.dataset.intro
    run() // second view in the session
    boot().go()
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

describe("ready gate (go / budget / abort)", () => {
  const events = () => {
    const seen = { go: vi.fn(), end: vi.fn() }
    window.addEventListener("mm:intro-go", seen.go)
    window.addEventListener("mm:intro-end", seen.end)
    return {
      ...seen,
      off: () => (
        window.removeEventListener("mm:intro-go", seen.go),
        window.removeEventListener("mm:intro-end", seen.end)
      ),
    }
  }

  it("shows plain ink with no go signal and nothing started", () => {
    vi.useFakeTimers()
    run()
    expect(html.dataset.intro).toBe("full")
    expect(html.hasAttribute("data-intro-go")).toBe(false)
    expect(boot().tGo).toBe(0)
    vi.advanceTimersByTime(READY.abortAt - 1)
    expect(html.dataset.intro).toBe("full") // still waiting inside the budget
  })

  it("go() starts the clock: sets data-intro-go, records tGo, announces once, and is idempotent", () => {
    vi.useFakeTimers()
    const ev = events()
    run()
    vi.advanceTimersByTime(400)
    expect(boot().go()).toBe("full")
    expect(html.hasAttribute("data-intro-go")).toBe(true)
    expect(boot().tGo).toBeGreaterThanOrEqual(boot().t0 + 400)
    expect(boot().go()).toBe("full")
    expect(ev.go).toHaveBeenCalledTimes(1)
    ev.off()
  })

  it("plays full when ready inside the budget and short when ready a little later", () => {
    vi.useFakeTimers()
    run()
    vi.advanceTimersByTime(READY.fullBy - 1)
    expect(boot().plan()).toBe("full")
    vi.advanceTimersByTime(2)
    expect(boot().plan()).toBe("short")
    expect(boot().go()).toBe("short")
    expect(html.dataset.intro).toBe("short")
    expect(boot().mode).toBe("short")
  })

  it("go(mode) takes the mode the stage prepared for", () => {
    vi.useFakeTimers()
    run()
    expect(boot().go("short")).toBe("short")
    expect(html.dataset.intro).toBe("short")
  })

  it("re-arms the timeout from go, not from boot", () => {
    vi.useFakeTimers()
    run()
    vi.advanceTimersByTime(READY.fullBy - 100)
    boot().go()
    vi.advanceTimersByTime(INTRO.full.timeout - 1)
    expect(html.dataset.intro).toBe("full")
    vi.advanceTimersByTime(2)
    expect(html.dataset.intro).toBe("done")
  })

  it("aborts with a soft fade when go never comes, then ends; a late go does nothing", () => {
    vi.useFakeTimers()
    const ev = events()
    run()
    vi.advanceTimersByTime(READY.abortAt + 1)
    expect(html.dataset.intro).toBe("abort")
    expect(boot().aborted).toBe(1)
    expect(ev.end).toHaveBeenCalledTimes(1)
    expect(boot().plan()).toBe("")
    expect(boot().go()).toBe("")
    expect(html.hasAttribute("data-intro-go")).toBe(false)
    expect(html.dataset.intro).toBe("abort")
    vi.advanceTimersByTime(READY.abortFade + 40)
    expect(html.dataset.intro).toBe("done")
    expect(ev.end).toHaveBeenCalledTimes(1)
    ev.off()
  })

  it("an abort waits for web fonts still loading (no fallback-font reveal), capped at fontsBy", async () => {
    vi.useFakeTimers()
    let settle: () => void = () => {}
    const ready = new Promise<void>((r) => (settle = r))
    const fonts = { status: "loading", ready }
    Object.defineProperty(document, "fonts", { value: fonts, configurable: true })
    try {
      const ev = events()
      run()
      vi.advanceTimersByTime(READY.abortAt + 1)
      expect(html.dataset.intro).toBe("full") // still ink: the fonts are not in yet
      expect(boot().go()).toBe("") // no late start while it waits
      expect(ev.end).not.toHaveBeenCalled()
      settle()
      await ready
      await Promise.resolve()
      expect(html.dataset.intro).toBe("abort")
      expect(ev.end).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(READY.fontsBy)
      expect(ev.end).toHaveBeenCalledTimes(1) // the cap timer does nothing once faded
      ev.off()
    } finally {
      delete (document as { fonts?: unknown }).fonts
    }
  })

  it("an abort never waits for a stalled font past fontsBy", () => {
    vi.useFakeTimers()
    const fonts = { status: "loading", ready: new Promise<void>(() => {}) }
    Object.defineProperty(document, "fonts", { value: fonts, configurable: true })
    try {
      run()
      vi.advanceTimersByTime(READY.fontsBy - 1)
      expect(html.dataset.intro).toBe("full")
      vi.advanceTimersByTime(2)
      expect(html.dataset.intro).toBe("abort")
      expect(boot().aborted).toBe(1)
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }))
      vi.advanceTimersByTime(READY.abortFade + 40)
      expect(html.dataset.intro).toBe("done")
    } finally {
      delete (document as { fonts?: unknown }).fonts
    }
  })

  it("refuses a go after the budget even if the abort timer has not fired yet", () => {
    vi.useFakeTimers()
    run()
    vi.setSystemTime(Date.now())
    vi.advanceTimersByTime(READY.abortAt + 5)
    expect(boot().go()).toBe("")
  })

  it("a skip before go ends at once with no fade", () => {
    vi.useFakeTimers()
    run()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }))
    expect(html.dataset.intro).toBe("done")
    expect(boot().go()).toBe("")
    vi.advanceTimersByTime(READY.abortAt + 500)
    expect(html.dataset.intro).toBe("done")
  })

  it("a skip during the sequence ends it at once", () => {
    vi.useFakeTimers()
    run()
    boot().go()
    vi.advanceTimersByTime(800)
    window.dispatchEvent(new Event("wheel"))
    expect(html.dataset.intro).toBe("done")
  })

  it("?intro=full forces the mode with no budget and no abort until the last-resort cap", () => {
    vi.useFakeTimers()
    setUrl("/?intro=full")
    run()
    vi.advanceTimersByTime(READY.abortAt * 3)
    expect(html.dataset.intro).toBe("full")
    expect(boot().plan()).toBe("full")
    expect(boot().go()).toBe("full")
    vi.advanceTimersByTime(INTRO.full.timeout + 1)
    expect(html.dataset.intro).toBe("done")
  })

  it("?intro=full still ends by the last-resort cap if go never comes", () => {
    vi.useFakeTimers()
    setUrl("/?intro=full")
    run()
    vi.advanceTimersByTime(READY.safe + READY.abortFade + 100)
    expect(html.dataset.intro).toBe("done")
  })

  it("keeps a sane budget", () => {
    expect(READY.fullBy).toBeLessThan(READY.abortAt)
    expect(READY.abortAt).toBeLessThanOrEqual(2000)
    expect(READY.abortFade).toBeLessThanOrEqual(400)
    expect(READY.fontsBy).toBeGreaterThan(READY.abortAt)
    expect(READY.fontsBy).toBeLessThanOrEqual(3000)
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
