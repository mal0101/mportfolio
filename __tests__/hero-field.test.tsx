import { INTRO } from "@/lib/intro"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"
import { HeroField } from "@/components/hero-field"
import { resetPortraitMemo } from "@/lib/portrait"

const getContext = HTMLCanvasElement.prototype.getContext

// A 2D context whose every method is a spy and every property is writable (jsdom has no canvas backend).
function fakeContext() {
  const calls: Record<string, number> = {}
  const store: Record<string | symbol, unknown> = {}
  const ctx = new Proxy(store, {
    get(target, key) {
      if (key in target) return target[key]
      if (key === "getImageData")
        return (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) })
      if (key === "createRadialGradient" || key === "createLinearGradient") return () => ({ addColorStop() {} })
      if (key === "createImageData") return (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) })
      return () => {
        calls[String(key)] = (calls[String(key)] ?? 0) + 1
      }
    },
    set(target, key, value) {
      target[key] = value
      return true
    },
  })
  return { ctx, calls }
}

// jsdom's Image never decodes; the portrait photo must degrade to "no colour core", not throw.
const decode = HTMLImageElement.prototype.decode
beforeAll(() => {
  HTMLImageElement.prototype.decode = () => Promise.reject(new Error("no decode in jsdom"))
})
afterAll(() => {
  HTMLImageElement.prototype.decode = decode
})

afterEach(() => {
  resetPortraitMemo()
  HTMLCanvasElement.prototype.getContext = getContext
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("HeroField", () => {
  it("renders a decorative wrapper with a canvas, not ready before the first draw", () => {
    const { container } = render(<HeroField />)
    const wrap = container.querySelector(".hero-field")
    expect(wrap).toHaveAttribute("aria-hidden", "true")
    expect(wrap).toHaveAttribute("data-ready", "false")
    expect(wrap?.querySelector("canvas")).not.toBeNull()
  })

  it("keeps the CSS dot texture when canvas is unavailable (getContext returns null)", () => {
    vi.useFakeTimers()
    const { container, unmount } = render(<HeroField />)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(container.querySelector(".hero-field")).toHaveAttribute("data-ready", "false")
    expect(() => unmount()).not.toThrow()
  })

  it("draws once, marks itself ready, and cleans up on unmount", () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      "Path2D",
      class {
        constructor(public d?: string) {}
      },
    )
    const { ctx, calls } = fakeContext()
    HTMLCanvasElement.prototype.getContext = (() => ctx) as unknown as HTMLCanvasElement["getContext"]
    const { container, unmount } = render(
      <section>
        <HeroField />
      </section>,
    )
    act(() => {
      vi.advanceTimersByTime(300) // idle fallback (setTimeout 200) runs init
    })
    expect(container.querySelector(".hero-field")).toHaveAttribute("data-ready", "true")
    expect(calls.drawImage).toBe(1)
    expect(() => unmount()).not.toThrow()
  })

  it("blooms when the intro ends without throwing", () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      "Path2D",
      class {
        constructor(public d?: string) {}
      },
    )
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16))
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id))
    const { ctx, calls } = fakeContext()
    HTMLCanvasElement.prototype.getContext = (() => ctx) as unknown as HTMLCanvasElement["getContext"]
    document.documentElement.dataset.intro = "short"
    ;(window as Window & { __mmIntro?: { mode: "short"; t0: number } }).__mmIntro = { mode: "short", t0: 0 }
    const { unmount } = render(
      <section>
        <HeroField />
      </section>,
    )
    act(() => {
      vi.advanceTimersByTime(300)
    })
    const before = calls.drawImage
    act(() => {
      window.dispatchEvent(new Event("mm:intro-end"))
    })
    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(calls.drawImage).toBeGreaterThan(before)
    delete document.documentElement.dataset.intro
    delete (window as Window & { __mmIntro?: unknown }).__mmIntro
    expect(() => unmount()).not.toThrow()
  })

  it("takes the portrait path in a roomy hero: mounts, draws once, lights up on lamp-on, unmounts", () => {
    vi.useFakeTimers()
    vi.stubGlobal("Path2D", class {})
    vi.stubGlobal("innerWidth", 1440)
    const rectOf = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 1440, bottom: 900, width: 1440, height: 900, x: 0, y: 0, toJSON() {} }) as DOMRect
    const { ctx, calls } = fakeContext()
    HTMLCanvasElement.prototype.getContext = (() => ctx) as unknown as HTMLCanvasElement["getContext"]
    document.documentElement.dataset.lamp = "on"
    try {
      const { container, unmount } = render(
        <section>
          <HeroField />
        </section>,
      )
      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(container.querySelector(".hero-field")).toHaveAttribute("data-ready", "true")
      expect(calls.drawImage).toBe(1)
      expect(calls.fillRect).toBeGreaterThan(100) // the revealed halftone dots, not the M
      expect(() => unmount()).not.toThrow()
    } finally {
      HTMLElement.prototype.getBoundingClientRect = rectOf
      delete document.documentElement.dataset.lamp
    }
  })

  describe("portrait colour core and fallbacks", () => {
    const rectOf = HTMLElement.prototype.getBoundingClientRect
    const roomy = () => {
      vi.useFakeTimers()
      vi.stubGlobal("Path2D", class {})
      vi.stubGlobal("innerWidth", 1440)
      HTMLElement.prototype.getBoundingClientRect = () =>
        ({ left: 0, top: 0, right: 1440, bottom: 900, width: 1440, height: 900, x: 0, y: 0, toJSON() {} }) as DOMRect
      const fake = fakeContext()
      HTMLCanvasElement.prototype.getContext = (() => fake.ctx) as unknown as HTMLCanvasElement["getContext"]
      return fake
    }
    const mount = (C = HeroField) =>
      render(
        <section>
          <C />
        </section>,
      )
    const flush = () => act(async () => await Promise.resolve())
    afterEach(() => {
      HTMLElement.prototype.getBoundingClientRect = rectOf
      HTMLImageElement.prototype.decode = () => Promise.reject(new Error("no decode in jsdom"))
      delete document.documentElement.dataset.lamp
    })

    it("announces the hand-off bloom when the intro ends, and draws the resting ghost without throwing", () => {
      const { calls } = roomy()
      vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16))
      vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id))
      document.documentElement.dataset.intro = "full"
      ;(window as Window & { __mmIntro?: unknown }).__mmIntro = { mode: "full", t0: performance.now() }
      const seen = vi.fn()
      window.addEventListener("mm:field-bloom", seen)
      try {
        const { unmount } = mount()
        act(() => {
          vi.advanceTimersByTime(150) // the intro is running: init in a short slot of its own (idle callback, or 60ms without one)
        })
        expect(calls.fillRect).toBeGreaterThan(100) // the ghost: portrait dots drawn at rest, no lamp
        expect(seen).not.toHaveBeenCalled()
        act(() => {
          window.dispatchEvent(new Event("mm:intro-end"))
        })
        expect(seen).toHaveBeenCalledTimes(1)
        act(() => {
          vi.advanceTimersByTime(100)
        })
        expect(() => unmount()).not.toThrow()
      } finally {
        window.removeEventListener("mm:field-bloom", seen)
        delete document.documentElement.dataset.intro
        delete (window as Window & { __mmIntro?: unknown }).__mmIntro
      }
    })

    it("arms the hand-off at go: a late go blooms on the CSS clock after it, never before", () => {
      roomy()
      vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16))
      vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id))
      document.documentElement.dataset.intro = "short"
      const boot = { mode: "short", t0: performance.now(), tGo: 0 }
      ;(window as Window & { __mmIntro?: unknown }).__mmIntro = boot
      const seen = vi.fn()
      window.addEventListener("mm:field-bloom", seen)
      try {
        const { unmount } = mount()
        act(() => {
          vi.advanceTimersByTime(1500) // init ran long ago; no go yet: no bloom, whatever the clock says
        })
        expect(seen).not.toHaveBeenCalled()
        boot.tGo = performance.now()
        act(() => {
          document.documentElement.setAttribute("data-intro-go", "")
          window.dispatchEvent(new Event("mm:intro-go"))
          vi.advanceTimersByTime(INTRO.short.collapse - 50)
        })
        expect(seen).not.toHaveBeenCalled()
        act(() => {
          vi.advanceTimersByTime(100)
        })
        expect(seen).toHaveBeenCalledTimes(1)
        expect(() => unmount()).not.toThrow()
      } finally {
        window.removeEventListener("mm:field-bloom", seen)
        document.documentElement.removeAttribute("data-intro-go")
        delete document.documentElement.dataset.intro
        delete (window as Window & { __mmIntro?: unknown }).__mmIntro
      }
    })

    it("settles after an abort: the plain bloom fires at once and the late go does not re-bloom", () => {
      roomy()
      vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16))
      vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id))
      document.documentElement.dataset.intro = "full"
      ;(window as Window & { __mmIntro?: unknown }).__mmIntro = {
        mode: "full",
        t0: performance.now(),
        tGo: 0,
        aborted: 0,
      }
      const seen = vi.fn()
      window.addEventListener("mm:field-bloom", seen)
      try {
        const { unmount } = mount()
        act(() => {
          vi.advanceTimersByTime(300)
        })
        ;(window as Window & { __mmIntro?: { aborted: number } }).__mmIntro!.aborted = 1
        act(() => {
          document.documentElement.dataset.intro = "abort"
          window.dispatchEvent(new Event("mm:intro-end"))
        })
        expect(seen).toHaveBeenCalledTimes(1)
        act(() => {
          window.dispatchEvent(new Event("mm:intro-go"))
          vi.advanceTimersByTime(3000)
        })
        expect(seen).toHaveBeenCalledTimes(1)
        expect(() => unmount()).not.toThrow()
      } finally {
        window.removeEventListener("mm:field-bloom", seen)
        delete document.documentElement.dataset.intro
        delete (window as Window & { __mmIntro?: unknown }).__mmIntro
      }
    })

    it("bakes the cutout when the photo decodes before init", async () => {
      const { calls } = roomy()
      HTMLImageElement.prototype.decode = () => Promise.resolve()
      const { unmount } = mount()
      await flush() // decoded, but no field yet: nothing baked, nothing drawn
      expect(calls.drawImage ?? 0).toBe(0)
      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(calls.putImageData).toBe(1) // the matte
      expect(calls.drawImage).toBe(3) // photo + matte into the cutout, then the baked field
      unmount()
    })

    it("bakes the cutout and redraws when the photo decodes after init", async () => {
      const { calls } = roomy()
      let done = () => {}
      HTMLImageElement.prototype.decode = () => new Promise<void>((r) => (done = r))
      const { unmount } = mount()
      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(calls.drawImage).toBe(1)
      done()
      await flush()
      expect(calls.drawImage).toBe(4)
      unmount()
    })

    it("ignores a photo that decodes after unmount", async () => {
      const { calls } = roomy()
      let done = () => {}
      HTMLImageElement.prototype.decode = () => new Promise<void>((r) => (done = r))
      const { unmount } = mount()
      act(() => {
        vi.advanceTimersByTime(300)
      })
      unmount()
      done()
      await flush()
      expect(calls.drawImage).toBe(1)
      expect(calls.putImageData ?? 0).toBe(0)
    })

    it("still initialises when document.fonts.ready never settles", () => {
      roomy()
      const fonts = Object.getOwnPropertyDescriptor(document, "fonts")
      Object.defineProperty(document, "fonts", { configurable: true, value: { ready: new Promise(() => {}) } })
      try {
        const { container, unmount } = mount()
        act(() => {
          vi.advanceTimersByTime(1000)
        })
        expect(container.querySelector(".hero-field")).toHaveAttribute("data-ready", "false")
        act(() => {
          vi.advanceTimersByTime(2300) // 3000ms stall fallback, then the 200ms idle fallback
        })
        expect(container.querySelector(".hero-field")).toHaveAttribute("data-ready", "true")
        unmount()
      } finally {
        if (fonts) Object.defineProperty(document, "fonts", fonts)
        else delete (document as unknown as { fonts?: unknown }).fonts
      }
    })

    it("falls back to the hidden M when no portrait fits, even with the photo decoded and the lamp on", async () => {
      const { ctx, calls } = roomy()
      // every mask cell opaque, so the M payload is non-empty
      ;(ctx as unknown as Record<string, unknown>).getImageData = (_x: number, _y: number, w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4).fill(255),
      })
      HTMLImageElement.prototype.decode = () => Promise.resolve()
      document.documentElement.dataset.lamp = "on"
      vi.resetModules()
      vi.doMock("@/lib/portrait", async (orig) => ({
        ...(await orig<typeof import("@/lib/portrait")>()),
        placePortrait: () => null,
      }))
      try {
        const { HeroField: Mocked } = await import("@/components/hero-field")
        const { container, unmount } = mount(Mocked)
        await flush()
        act(() => {
          vi.advanceTimersByTime(300)
        })
        expect(container.querySelector(".hero-field")).toHaveAttribute("data-ready", "true")
        expect(calls.stroke).toBeGreaterThan(0) // the M rasterised into the mask
        expect(calls.putImageData ?? 0).toBe(0) // no portrait rect: no cutout baked
        expect(calls.drawImage).toBe(1)
        expect(calls.fillRect).toBeGreaterThan(0) // the revealed M squares
        unmount()
      } finally {
        vi.doUnmock("@/lib/portrait")
        vi.resetModules()
      }
    })
  })
})
