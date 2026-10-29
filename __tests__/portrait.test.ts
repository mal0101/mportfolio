import { describe, expect, it, vi } from "vitest"
import {
  PORTRAIT,
  coreAlpha,
  curve,
  decodeTones,
  dotPitchFor,
  drawCell,
  matteAt,
  payloadMask,
  placePortrait,
  portraitDots,
  squareAlpha,
  squareSize,
  toneAt,
  type Box,
} from "@/lib/portrait"

const base = { w: 1440, h: 800, mobile: false, dpr: 1, top: 100, right: 1356, boxes: [] as Box[], pitch: 12 }

describe("portrait tones", () => {
  it("decodes 120x150 samples in 0..1 with a matte that has both 0s and 1s", () => {
    const { lum, matte } = decodeTones()
    expect(lum).toHaveLength(18000)
    expect(matte).toHaveLength(18000)
    for (const a of [lum, matte]) for (const v of a) expect(v >= 0 && v <= 1).toBe(true)
    expect(matte.some((v) => v === 0)).toBe(true)
    expect(matte.some((v) => v === 1)).toBe(true)
    expect(decodeTones()).toBe(decodeTones())
  })
  it("toneAt is 0 outside the image, deterministic, > 0 on the face and 0 in the far corner", () => {
    expect(toneAt(-0.01, 0.5)).toBe(0)
    expect(toneAt(0.5, 1.01)).toBe(0)
    expect(toneAt(0.4, 0.3)).toBe(toneAt(0.4, 0.3))
    expect(toneAt(0.32, 0.3)).toBeGreaterThan(0)
    expect(toneAt(0.98, 0.02)).toBe(0)
  })
  it("keeps the eyes darker than the cheek below them (local contrast survives the bake)", () => {
    // left eye ~(0.26, 0.31) in the 500x625 source; cheek ~(0.26, 0.40)
    expect(toneAt(0.26, 0.31)).toBeLessThan(toneAt(0.26, 0.4) - 0.2)
  })
  it("matteAt is 1 on the face, 0 in the top-right background and outside", () => {
    expect(matteAt(0.3, 0.4)).toBeCloseTo(1, 5)
    expect(matteAt(0.98, 0.05)).toBe(0)
    expect(matteAt(1.2, 0.5)).toBe(0)
  })
  it("curve is monotonic from 0 to 1", () => {
    expect(curve(0)).toBe(0)
    expect(curve(1)).toBeCloseTo(1, 10)
    let prev = -1
    for (let L = 0; L <= 1.0001; L += 0.01) {
      expect(curve(L)).toBeGreaterThanOrEqual(prev)
      prev = curve(L)
    }
  })
})

describe("placePortrait", () => {
  it("is 4:5 within one cell and right-aligned on the grid", () => {
    const r = placePortrait(base)!
    expect(r).not.toBeNull()
    expect(Math.abs(r.w - r.h * PORTRAIT.aspect)).toBeLessThanOrEqual(12)
    expect(r.x % 12).toBe(0)
    expect(r.y % 12).toBe(0)
    expect(r.x).toBeGreaterThanOrEqual(0.58 * base.w)
    expect(r.y).toBeGreaterThanOrEqual(base.top)
    expect(r.y + r.h).toBeLessThanOrEqual(0.72 * base.h)
  })
  it("caps the height at 469px for DPR 2", () => {
    const r = placePortrait({ ...base, dpr: 2, h: 1400, w: 1800, right: 1700 })!
    expect(r.h).toBeLessThanOrEqual(469)
  })
  it("avoids a box placed in the band", () => {
    const box: Box = { l: 1000, t: 300, r: 1440, b: 400 }
    const r = placePortrait({ ...base, h: 1000, boxes: [box] })!
    expect(r).not.toBeNull()
    expect(r.y < box.b && r.y + r.h > box.t && r.x < box.r && r.x + r.w > box.l).toBe(false)
  })
  it("returns null when boxes fill everything", () => {
    expect(placePortrait({ ...base, boxes: [{ l: 0, t: 0, r: 1440, b: 800 }] })).toBeNull()
  })
  it("fits mobile within 62% of the width", () => {
    const r = placePortrait({ ...base, w: 390, h: 800, mobile: true, pitch: 10, right: 370, top: 84 })!
    expect(r).not.toBeNull()
    expect(r.w).toBeLessThanOrEqual(0.62 * 390)
    expect(r.y + r.h).toBeLessThanOrEqual(0.7 * 800)
  })
})

describe("portraitDots", () => {
  const rect = placePortrait(base)!
  const dot = dotPitchFor(12)
  it("uses half the field pitch", () => {
    expect(dotPitchFor(12)).toBe(6)
    expect(dotPitchFor(8)).toBe(4)
  })
  it("is computed once per rect and pitch (HeroField and the intro share it)", () => {
    expect(portraitDots(rect, dot)).toBe(portraitDots(rect, dot))
    expect(portraitDots({ ...rect, x: rect.x + 1 }, dot)).not.toBe(portraitDots(rect, dot))
    expect(portraitDots(rect, dot + 1)).not.toBe(portraitDots(rect, dot))
    // a resize to a new rect and back recomputes the same grid, never a stale one
    const a = portraitDots(rect, dot)
    const b = portraitDots({ ...rect, w: rect.w + 10 }, dot)
    expect(b.x.length).not.toBe(0)
    expect(portraitDots(rect, dot)).toEqual(a)
  })
  it("is deterministic", () => {
    const a = portraitDots(rect, dot)
    const b = portraitDots(rect, dot)
    expect(a.x).toEqual(b.x)
    expect(a.y).toEqual(b.y)
    expect(a.tone).toEqual(b.tone)
  })
  it("places grid-snapped dots inside the rect, row-major, all above payloadMin", () => {
    const { x, y, tone } = portraitDots(rect, dot)
    expect(x.length).toBe(y.length)
    expect(x.length).toBe(tone.length)
    expect(x.length).toBeGreaterThan(1000)
    for (let k = 0; k < x.length; k++) {
      expect((x[k] / dot - 0.5) % 1).toBeCloseTo(0, 5)
      expect((y[k] / dot - 0.5) % 1).toBeCloseTo(0, 5)
      expect(x[k] >= rect.x && x[k] <= rect.x + rect.w && y[k] >= rect.y && y[k] <= rect.y + rect.h).toBe(true)
      expect(tone[k]).toBeGreaterThan(PORTRAIT.payloadMin)
      expect(tone[k]).toBeLessThanOrEqual(1)
      if (k) expect(y[k] > y[k - 1] || (y[k] === y[k - 1] && x[k] > x[k - 1])).toBe(true)
    }
  })
  it("has about 60 rows at a 360px portrait height", () => {
    const r = { x: 0, y: 0, w: 288, h: 360 }
    const rows = new Set(portraitDots(r, 6).y).size
    expect(rows).toBeGreaterThanOrEqual(55)
    expect(rows).toBeLessThanOrEqual(60)
  })
})

describe("payloadMask", () => {
  const rect = placePortrait(base)!
  const cols = Math.ceil(base.w / 12)
  const rows = Math.ceil(base.h / 12)
  it("is 0 outside the rect, in 0..1 inside, full on the face", () => {
    const m = payloadMask(rect, 12, cols, rows)
    expect(m).toHaveLength(cols * rows)
    expect(m[0]).toBe(0)
    expect(m[rows * cols - 1]).toBe(0)
    for (const v of m) expect(v >= 0 && v <= 1).toBe(true)
    const fi = Math.floor((rect.x + 0.3 * rect.w) / 12)
    const fj = Math.floor((rect.y + 0.4 * rect.h) / 12)
    expect(m[fj * cols + fi]).toBeGreaterThan(0.95)
    expect(m.some((v) => v === 0)).toBe(true)
  })
  it("is deterministic", () => {
    expect(payloadMask(rect, 12, cols, rows)).toEqual(payloadMask(rect, 12, cols, rows))
  })
})

describe("squareSize", () => {
  it("grows with tone and never touches the neighbouring dot", () => {
    expect(squareSize(0, 6)).toBeCloseTo(0.6)
    expect(squareSize(0.5, 6)).toBeGreaterThan(squareSize(0.2, 6))
    expect(squareSize(1, 6)).toBe(5)
    expect(squareSize(1, 4)).toBe(3)
  })
})

describe("drawCell", () => {
  it("fills a halo and a core", () => {
    const ctx = { fillRect: vi.fn(), globalAlpha: 1 } as unknown as CanvasRenderingContext2D
    drawCell(ctx, 100, 100, 0.8, 1, 1, 6)
    expect(ctx.fillRect).toHaveBeenCalledTimes(2)
    const [halo, core] = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls
    expect(core[2]).toBeCloseTo(squareSize(0.8, 6))
    expect(halo[2]).toBeCloseTo(squareSize(0.8, 6) + 2)
    expect(ctx.globalAlpha).toBeCloseTo(squareAlpha(0.8))
  })
})

describe("colour core", () => {
  it("is fully opaque on the plateau, then falls monotonically to 0 at the core edge", () => {
    expect(coreAlpha(0)).toBe(1)
    expect(coreAlpha(PORTRAIT.coreFlat)).toBe(1)
    expect(coreAlpha(1)).toBe(0)
    expect(coreAlpha(1.5)).toBe(0)
    let prev = 1
    for (let f = 0; f <= 1; f += 0.05) {
      const a = coreAlpha(f)
      expect(a).toBeLessThanOrEqual(prev + 1e-9)
      prev = a
    }
    expect(coreAlpha((1 + PORTRAIT.coreFlat) / 2)).toBeCloseTo(0.5)
  })
})
