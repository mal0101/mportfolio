import { afterEach, describe, expect, it, vi } from "vitest"
import { render } from "@testing-library/react"
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

afterEach(() => {
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

  it("cleans up its frame loop and listeners on unmount", () => {
    html.dataset.intro = "full"
    vi.stubGlobal(
      "Path2D",
      class {
        moveTo() {}
        lineTo() {}
      },
    )
    HTMLCanvasElement.prototype.getContext = (() => fakeCtx()) as unknown as HTMLCanvasElement["getContext"]
    const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 7)
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})
    const add = vi.spyOn(window, "addEventListener")
    const remove = vi.spyOn(window, "removeEventListener")
    const { unmount } = render(<Host />)
    expect(raf).toHaveBeenCalled()
    const added = add.mock.calls.map((c) => c[0]).filter((t) => t === "resize" || t === "mm:intro-end")
    expect(added.sort()).toEqual(["mm:intro-end", "resize"])
    unmount()
    expect(cancel).toHaveBeenCalledWith(7)
    const removed = remove.mock.calls.map((c) => c[0])
    expect(removed).toContain("resize")
    expect(removed).toContain("mm:intro-end")
  })
})
