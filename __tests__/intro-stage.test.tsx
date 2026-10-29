import { afterEach, describe, expect, it, vi } from "vitest"
import { render, waitFor } from "@testing-library/react"
import { IntroStage } from "@/components/intro-stage"

const html = document.documentElement
const getContext = HTMLCanvasElement.prototype.getContext

function Host() {
  return (
    <div className="intro">
      <canvas />
      <IntroStage />
    </div>
  )
}

function fakeCtx() {
  const fn = vi.fn()
  return new Proxy(
    { canvas: null as unknown },
    {
      get: (t, k) =>
        k in t
          ? (t as Record<string | symbol, unknown>)[k]
          : k === "createRadialGradient"
            ? () => ({ addColorStop: fn })
            : fn,
      set: () => true,
    },
  ) as unknown as CanvasRenderingContext2D
}

type Boot = { mode: string; t0: number; tGo: number; go: ReturnType<typeof vi.fn>; plan: ReturnType<typeof vi.fn> }
const setBoot = (b: Partial<Boot> = {}) => {
  const boot: Boot = {
    mode: "full",
    t0: 0,
    tGo: 0,
    plan: vi.fn(() => "full"),
    go: vi.fn((m?: string) => {
      boot.tGo = performance.now()
      return m ?? "full"
    }),
    ...b,
  }
  ;(window as Window & { __mmIntro?: unknown }).__mmIntro = boot
  return boot
}
const runFrames = () => {
  let frames = 0
  return vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    if (frames++ < 3) setTimeout(() => cb(performance.now()), 0)
    return 7
  })
}
const decodes = HTMLImageElement.prototype.decode

afterEach(() => {
  delete (window as Window & { __mmIntro?: unknown }).__mmIntro
  HTMLImageElement.prototype.decode = decodes
  document.body.innerHTML = ""
  delete (HTMLElement.prototype as unknown as { offsetWidth?: number }).offsetWidth
  delete html.dataset.intro
  HTMLCanvasElement.prototype.getContext = getContext
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("IntroStage", () => {
  it("does nothing without data-intro", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame")
    const { container, unmount } = render(<Host />)
    expect(raf).not.toHaveBeenCalled()
    expect(container.querySelector(".intro")?.children).toHaveLength(1) // the canvas only: it renders nothing itself
    unmount()
  })

  it("does not throw when the canvas has no 2d context (jsdom)", () => {
    html.dataset.intro = "full"
    HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement["getContext"]
    const raf = vi.spyOn(window, "requestAnimationFrame")
    expect(() => render(<Host />).unmount()).not.toThrow()
    expect(raf).not.toHaveBeenCalled()
  })

  it("waits for readiness, then calls go once and starts the frame loop; cleans up on unmount", async () => {
    html.dataset.intro = "full"
    HTMLImageElement.prototype.decode = () => Promise.resolve()
    vi.stubGlobal(
      "Path2D",
      class {
        moveTo() {}
        lineTo() {}
      },
    )
    HTMLCanvasElement.prototype.getContext = (() => fakeCtx()) as unknown as HTMLCanvasElement["getContext"]
    const boot = setBoot()
    const raf = runFrames() // the go frame, then a couple of loop frames
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})
    const add = vi.spyOn(window, "addEventListener")
    const remove = vi.spyOn(window, "removeEventListener")
    const { unmount } = render(<Host />)
    expect(boot.go).not.toHaveBeenCalled() // nothing has started yet: fonts, portrait and prep come first
    await waitFor(() => expect(boot.go).toHaveBeenCalledTimes(1))
    expect(boot.go).toHaveBeenCalledWith("full")
    await waitFor(() => expect(raf.mock.calls.length).toBeGreaterThan(1))
    const added = add.mock.calls.map((c) => c[0]).filter((t) => t === "resize" || t === "mm:intro-end")
    expect(added.sort()).toEqual(["mm:intro-end", "resize"])
    unmount()
    expect(cancel).toHaveBeenCalled()
    const removed = remove.mock.calls.map((c) => c[0])
    expect(removed).toContain("resize")
    expect(removed).toContain("mm:intro-end")
  })

  it("never calls go when the boot script refuses (aborted or skipped while getting ready)", async () => {
    html.dataset.intro = "full"
    HTMLImageElement.prototype.decode = () => Promise.resolve()
    HTMLCanvasElement.prototype.getContext = (() => fakeCtx()) as unknown as HTMLCanvasElement["getContext"]
    const boot = setBoot({ plan: vi.fn(() => "") })
    const raf = vi.spyOn(window, "requestAnimationFrame")
    const { unmount } = render(<Host />)
    await waitFor(() => expect(boot.plan).toHaveBeenCalled())
    await new Promise((r) => setTimeout(r, 20))
    expect(boot.go).not.toHaveBeenCalled()
    expect(raf).not.toHaveBeenCalled()
    unmount()
  })

  it("does nothing without the boot script's go()", () => {
    html.dataset.intro = "full"
    HTMLCanvasElement.prototype.getContext = (() => fakeCtx()) as unknown as HTMLCanvasElement["getContext"]
    const raf = vi.spyOn(window, "requestAnimationFrame")
    expect(() => render(<Host />).unmount()).not.toThrow()
    expect(raf).not.toHaveBeenCalled()
  })

  it("marks the overlay measured only once it has measured the full stop (the flying square needs it)", async () => {
    html.dataset.intro = "short"
    HTMLImageElement.prototype.decode = () => Promise.resolve()
    HTMLCanvasElement.prototype.getContext = (() => fakeCtx()) as unknown as HTMLCanvasElement["getContext"]
    runFrames()
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 100,
      right: 116,
      bottom: 116,
      width: 16,
      height: 16,
      x: 100,
      y: 100,
      toJSON() {},
    })
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 16 })
    const boot = setBoot({ plan: vi.fn(() => "short") })
    // a page with a hero full stop
    const page = document.createElement("div")
    page.innerHTML = '<section class="hero"><span class="full-stop"></span><div class="hero-field"></div></section>'
    document.body.appendChild(page)
    const { container, unmount } = render(<Host />)
    const overlay = container.querySelector(".intro") as HTMLElement
    expect(overlay.hasAttribute("data-measured")).toBe(false)
    await waitFor(() => expect(boot.go).toHaveBeenCalled())
    expect(overlay.hasAttribute("data-measured")).toBe(true)
    unmount()
  })

  it("stays unmeasured when the page has no full stop to land on", async () => {
    html.dataset.intro = "short"
    HTMLImageElement.prototype.decode = () => Promise.resolve()
    HTMLCanvasElement.prototype.getContext = (() => fakeCtx()) as unknown as HTMLCanvasElement["getContext"]
    runFrames()
    const boot = setBoot({ plan: vi.fn(() => "short") })
    const { container, unmount } = render(<Host />)
    await waitFor(() => expect(boot.go).toHaveBeenCalled())
    expect((container.querySelector(".intro") as HTMLElement).hasAttribute("data-measured")).toBe(false)
    unmount()
  })
})
