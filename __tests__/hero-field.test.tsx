import { afterEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"
import { HeroField } from "@/components/hero-field"

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
      if (key === "createRadialGradient") return () => ({ addColorStop() {} })
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

afterEach(() => {
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
})
