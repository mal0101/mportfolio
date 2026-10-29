"use client"

import { useEffect, useRef } from "react"
import { INTRO, introClock } from "@/lib/intro"
import { heroLayout, heroSize } from "@/lib/hero-layout"
import {
  PORTRAIT,
  coreAlpha,
  dotPitchFor,
  bakeCutout,
  drawCell,
  matteCanvas,
  payloadMask,
  placePortrait,
  portraitDots,
  type Box,
  type Rect,
} from "@/lib/portrait"
import { photos } from "@/data/photos"

/*
 * The UV lamp (DESIGN §5.11). A microprint field of short dashes with a portrait of Malak hidden in its "low bits":
 * the portrait's halftone dots (their own fine grid) are invisible until a lamp passes over them, and the lens core
 * cross-dissolves into the real colour photo. If no portrait fits the hero, the M. mark is hidden instead.
 * Renders on demand only: no animation frame is scheduled while nothing changes, and none while the hero is
 * off-screen or the tab is hidden. Under reduced motion it draws one static frame with the halftone at 30% (mark 45%).
 */

type Field = {
  w: number
  h: number
  dpr: number
  pitch: number
  cols: number
  rows: number
  x: Float32Array
  y: Float32Array
  ang: Float32Array
  len: Float32Array
  alpha: Float32Array
  payload: Uint8Array
  payloadIdx: Uint32Array
  base: HTMLCanvasElement
  mode: "portrait" | "mark"
  rect: Rect | null
  // portrait mode: the fine dot grid, bucketed by field cell (CSR) so lamps visit only the dots in reach
  dots: { x: Float32Array; y: Float32Array; tone: Float32Array }
  cellStart: Uint32Array
  dotIdx: Uint32Array
  cover: Float32Array // per-cell matte coverage, 0..1
  dotPitch: number
  centreX: number
  centreY: number
  bloomR: number
}
/** core: 0 = pure halftone, 1 = the colour photo shows through the lamp's centre. */
type Lamp = { x: number; y: number; r: number; s: number; core: number }
/** Colour core: the photo with a feathered matte, plus a reusable per-lamp scratch canvas. */
type Core = { cutout: HTMLCanvasElement | null; tmp: HTMLCanvasElement }
type Layout = ReturnType<typeof heroLayout>
type BloomOpts = { grow?: number; hold?: number; fade?: number; core?: number }

const MARK_PATH = "M12 86 V16 L46 58 L80 16 V86" // same as components/ui/mark.tsx (viewBox 120x100)
const PAPER = "rgb(239,237,245)"

// Visual knobs (frozen after Phase 5 visual QA).
const NOISE = 0.055 // value-noise scale per cell
const A_MIN = 0.07 // daylight dash alpha range
const A_SPAN = 0.18
const A_LIT = 0.4 // dash alpha at full lamp strength
const POOL = 0.075 // UV pool alpha under a lamp
const BUCKETS = 8 // daylight alpha buckets (one stroke each)
const LEVELS = 40 // lit alpha levels (one stroke each)
const BLOOM_GROW = 1400
const BLOOM_HOLD = 700
const BLOOM_FADE = 1200
const GHOST = 0.14 // resting portrait reveal in daylight (P2b): a face silhouette that never competes with the name
// colour-core gradient stops (fraction, alpha), sampled once from the same curve that fades the dots out
const CORE_STOPS = Array.from({ length: 9 }, (_, i) => {
  const f = PORTRAIT.coreFlat + ((1 - PORTRAIT.coreFlat) * i) / 8
  return [f, coreAlpha(f)] as const
})

function hash2(x: number, y: number, seed: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
const smooth = (t: number) => t * t * (3 - 2 * t)
function noise(x: number, y: number, seed: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const u = smooth(x - xi)
  const v = smooth(y - yi)
  const a = hash2(xi, yi, seed)
  const b = hash2(xi + 1, yi, seed)
  const c = hash2(xi, yi + 1, seed)
  const d = hash2(xi + 1, yi + 1, seed)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
const fbm = (x: number, y: number) => 0.65 * noise(x, y, 11) + 0.35 * noise(x * 2.1, y * 2.1, 29)
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const sstep = (a: number, b: number, x: number) => smooth(clamp01((x - a) / (b - a)))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)
const easeInOut = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2)

function dash(c: CanvasRenderingContext2D, x: number, y: number, a: number, l: number) {
  const dx = (Math.cos(a) * l) / 2
  const dy = (Math.sin(a) * l) / 2
  c.moveTo(x - dx, y - dy)
  c.lineTo(x + dx, y + dy)
}

/**
 * Largest mark (height s, viewBox units scaled by s/100) whose box sits right-aligned to the content edge,
 * below the nav and clear of the hero copy. Falls back to the smallest size at the top of the band.
 * Mark box in viewBox units (miter tips included): x 6..108, y -1..92, i.e. centre (60,50) → x -54..+48,
 * y -51..+42.
 */
function placeMark(w: number, h: number, mobile: boolean, top: number, right: number, boxes: Box[]) {
  const maxS = mobile ? Math.min(h * 0.7, w * 0.55) : Math.min(h * 0.46, w * 0.34)
  const floor = h * (mobile ? 0.66 : 0.86) // stay above the bottom mask fade
  let s = maxS
  for (; s >= maxS * 0.5; s *= 0.95) {
    const cx = right - 0.48 * s
    const x0 = cx - 0.54 * s
    const x1 = cx + 0.48 * s
    let lim = floor
    for (const b of boxes) if (b.r > x0 && b.l < x1 && b.b > top) lim = Math.min(lim, b.t)
    const band = lim - top
    if (band >= 0.93 * s) return { x: cx, y: top + (band - 0.93 * s) / 2 + 0.51 * s, s }
  }
  s = maxS * 0.5
  return { x: right - 0.48 * s, y: top + 0.51 * s, s }
}

function buildField(w: number, h: number, mobile: boolean, layout: Layout): Field | null {
  const { dpr, pitch } = layout
  const cols = Math.ceil(w / pitch)
  const rows = Math.ceil(h / pitch)
  const n = cols * rows
  const rect = placePortrait({ w, h, mobile, dpr, top: layout.top, right: layout.right, boxes: layout.boxes, pitch })
  const mark = rect ? null : placeMark(w, h, mobile, layout.top, layout.right, layout.boxes)

  // 1. mark mode only: rasterise the M into a cell-resolution mask (the hidden "low bits")
  let md: Uint8ClampedArray | null = null
  if (mark) {
    const mask = document.createElement("canvas")
    mask.width = cols
    mask.height = rows
    const m = mask.getContext("2d", { willReadFrequently: true })
    if (!m) return null
    const s = mark.s / 100 / pitch
    m.translate(mark.x / pitch - 60 * s, mark.y / pitch - 50 * s)
    m.scale(s, s)
    m.strokeStyle = "#fff"
    m.fillStyle = "#fff"
    m.lineWidth = 12
    m.lineCap = "square"
    m.lineJoin = "miter"
    m.miterLimit = 4 // as in the SVG mark
    m.stroke(new Path2D(MARK_PATH))
    m.fillRect(94, 72, 14, 14)
    md = m.getImageData(0, 0, cols, rows).data
  }

  // 2. per-cell dash parameters (deterministic). Alpha is quantised to the daylight buckets so a lit cell at
  //    strength 0 is byte-identical to the baked field (no seam at the lamp edge).
  const x = new Float32Array(n)
  const y = new Float32Array(n)
  const ang = new Float32Array(n)
  const len = new Float32Array(n)
  const alpha = new Float32Array(n)
  const payload = new Uint8Array(n)
  const bucket = new Uint8Array(n)
  const idx: number[] = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i
      const v = fbm(i * NOISE, j * NOISE)
      x[k] = i * pitch + pitch / 2
      y[k] = j * pitch + pitch / 2
      ang[k] = v * Math.PI * 1.2 + (hash2(i, j, 71) - 0.5) * 0.5
      len[k] = 2 + v * 5
      const q = Math.min(BUCKETS - 1, Math.floor(v * v * BUCKETS))
      bucket[k] = q
      alpha[k] = A_MIN + (A_SPAN * (q + 0.5)) / BUCKETS
      if (md && md[k * 4 + 3] > 127) {
        payload[k] = 1
        idx.push(k)
      }
    }
  }

  // 3. bake the daylight field once (payload cells look identical to their neighbours)
  const base = document.createElement("canvas")
  base.width = Math.round(w * dpr)
  base.height = Math.round(h * dpr)
  const b = base.getContext("2d")
  if (!b) return null
  b.scale(dpr, dpr)
  b.lineWidth = 1
  b.strokeStyle = PAPER
  for (let q = 0; q < BUCKETS; q++) {
    b.globalAlpha = A_MIN + (A_SPAN * (q + 0.5)) / BUCKETS
    b.beginPath()
    for (let k = 0; k < n; k++) if (bucket[k] === q) dash(b, x[k], y[k], ang[k], len[k])
    b.stroke()
  }

  // 4. portrait mode: fine dots, their per-cell spatial index and the dash coverage
  const dotPitch = dotPitchFor(pitch)
  const dots = rect
    ? portraitDots(rect, dotPitch)
    : { x: new Float32Array(0), y: new Float32Array(0), tone: new Float32Array(0) }
  const nd = dots.x.length
  const cellStart = new Uint32Array(rect ? n + 1 : 1)
  const dotIdx = new Uint32Array(nd)
  if (rect) {
    const home = new Uint32Array(nd)
    for (let d = 0; d < nd; d++) {
      const i = Math.min(cols - 1, Math.max(0, Math.floor(dots.x[d] / pitch)))
      const j = Math.min(rows - 1, Math.max(0, Math.floor(dots.y[d] / pitch)))
      home[d] = j * cols + i
      cellStart[home[d] + 1]++
    }
    for (let k = 0; k < n; k++) cellStart[k + 1] += cellStart[k]
    const fill = cellStart.slice(0, n)
    for (let d = 0; d < nd; d++) dotIdx[fill[home[d]]++] = d
  }

  return {
    w,
    h,
    dpr,
    pitch,
    cols,
    rows,
    x,
    y,
    ang,
    len,
    alpha,
    payload,
    payloadIdx: Uint32Array.from(idx),
    base,
    mode: rect ? "portrait" : "mark",
    rect,
    dots,
    cellStart,
    dotIdx,
    cover: rect ? payloadMask(rect, pitch, cols, rows) : new Float32Array(0),
    dotPitch,
    centreX: rect ? rect.x + rect.w / 2 : mark!.x,
    centreY: rect ? rect.y + rect.h / 2 : mark!.y,
    bloomR: rect ? (Math.hypot(rect.w, rect.h) / 2) * 1.05 : mark!.s * 0.78 * 1.35,
  }
}

/** Reusable per-frame scratch buffers (sized to the field). */
type Scratch = {
  stamp: Uint32Array
  dstamp: Uint32Array
  cell: Uint32Array
  lit: Float32Array
  order: Uint32Array
  count: Uint32Array
}
const scratchFor = (n: number, nd = 0): Scratch => ({
  stamp: new Uint32Array(n),
  dstamp: new Uint32Array(nd),
  cell: new Uint32Array(n),
  lit: new Float32Array(n),
  order: new Uint32Array(n),
  count: new Uint32Array(LEVELS + 1),
})

function square(c: CanvasRenderingContext2D, f: Field, k: number, t: number) {
  // snapped to device pixels so the 3px square stays crisp at DPR 1
  const px = (v: number) => Math.round(v * f.dpr) / f.dpr
  c.globalAlpha = 0.18 * t
  c.fillRect(px(f.x[k] - 3.5), px(f.y[k] - 3.5), 7, 7)
  c.globalAlpha = t
  c.fillRect(px(f.x[k] - 1.5), px(f.y[k] - 1.5), 3, 3)
}

function render(
  ctx: CanvasRenderingContext2D,
  f: Field,
  lamps: Lamp[],
  reveal: number,
  uv: string,
  sc: Scratch,
  frame: number,
  core: Core,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "source-over"
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.drawImage(f.base, 0, 0)
  ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0)

  // reduced motion / lamp on: the payload is shown statically, quiet
  const portrait = f.mode === "portrait"
  const { dots } = f
  if (reveal > 0) {
    ctx.globalCompositeOperation = "lighter"
    ctx.fillStyle = `rgb(${uv})`
    if (portrait)
      for (let d = 0; d < dots.x.length; d++)
        drawCell(ctx, dots.x[d], dots.y[d], dots.tone[d], reveal, f.dpr, f.dotPitch)
    else for (const k of f.payloadIdx) square(ctx, f, k, reveal)
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
  }
  const active = lamps.filter((l) => l.s > 0.002 && l.r > 1)
  if (!active.length) return

  // Everything below is clipped to the union of the lamp discs: the daylight field is cleared there and
  // redrawn lit, so cells straddling the edge meet the baked field seamlessly.
  ctx.save()
  ctx.beginPath()
  for (const l of active) {
    ctx.moveTo(l.x + l.r, l.y)
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2)
  }
  ctx.clip()
  ctx.clearRect(0, 0, f.w, f.h)

  // UV pools
  ctx.globalCompositeOperation = "lighter"
  for (const l of active) {
    const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r)
    g.addColorStop(0, `rgba(${uv},${POOL * l.s})`)
    g.addColorStop(1, `rgba(${uv},0)`)
    ctx.fillStyle = g
    ctx.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2)
  }
  ctx.globalCompositeOperation = "source-over"

  // collect lit cells once (stamp de-duplicates overlapping lamps), bucket them by alpha
  const { stamp, cell, lit, order, count } = sc
  count.fill(0)
  let n = 0
  const reachPad = f.pitch / 2
  for (const l of active) {
    const reach = l.r + reachPad
    const i0 = Math.max(0, Math.floor((l.x - reach) / f.pitch))
    const i1 = Math.min(f.cols - 1, Math.ceil((l.x + reach) / f.pitch))
    const j0 = Math.max(0, Math.floor((l.y - reach) / f.pitch))
    const j1 = Math.min(f.rows - 1, Math.ceil((l.y + reach) / f.pitch))
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const k = j * f.cols + i
        if (stamp[k] === frame) continue
        let inside = false
        let t = 0
        for (const L of active) {
          const d = Math.hypot(f.x[k] - L.x, f.y[k] - L.y)
          if (d < L.r + reachPad) inside = true
          if (d < L.r) t = Math.max(t, L.s * (1 - sstep(L.r * 0.5, L.r, d)))
        }
        if (!inside) continue
        stamp[k] = frame
        cell[n] = k
        lit[n] = t
        const a = f.alpha[k] + (A_LIT - f.alpha[k]) * t
        // payload dashes fade out as their dots/squares appear
        const gone = portrait ? t * Math.min(1, f.cover[k] * 1.5) : f.payload[k] ? t : 0
        const level = Math.round(a * (1 - gone) * (LEVELS / A_LIT))
        order[n] = Math.min(LEVELS, level)
        count[order[n]]++
        n++
      }
    }
  }

  // lit dashes: comb flat and brighten; one stroke per level
  ctx.lineWidth = 1
  ctx.strokeStyle = PAPER
  for (let level = 1; level <= LEVELS; level++) {
    if (!count[level]) continue
    ctx.globalAlpha = (level * A_LIT) / LEVELS
    ctx.beginPath()
    for (let q = 0; q < n; q++) {
      if (order[q] !== level) continue
      const k = cell[q]
      const t = lit[q]
      dash(ctx, f.x[k], f.y[k], f.ang[k] * (1 - t), f.len[k] + t * 1.5)
    }
    ctx.stroke()
  }

  ctx.globalCompositeOperation = "lighter"
  ctx.fillStyle = `rgb(${uv})`
  if (!portrait) {
    // payload: UV squares with a soft halo (two squares, additive, no shadowBlur)
    for (let q = 0; q < n; q++) {
      const k = cell[q]
      if (f.payload[k] && lit[q] > 0.01) square(ctx, f, k, lit[q])
    }
  } else if (f.rect) {
    // portrait: halftone dots within lamp reach, via the per-cell index; the lamp core dissolves them into the photo
    const { dstamp } = sc
    const { cellStart, dotIdx, rect } = f
    for (const l of active) {
      // padded by a dot pitch: a dot just outside the disc can still reach into the clip with its halo
      const reach = l.r + f.dotPitch
      const i0 = Math.max(0, Math.floor((l.x - reach) / f.pitch))
      const i1 = Math.min(f.cols - 1, Math.floor((l.x + reach) / f.pitch))
      const j0 = Math.max(0, Math.floor((l.y - reach) / f.pitch))
      const j1 = Math.min(f.rows - 1, Math.floor((l.y + reach) / f.pitch))
      for (let j = j0; j <= j1; j++) {
        for (let k = j * f.cols + i0, e = j * f.cols + i1; k <= e; k++) {
          for (let m = cellStart[k]; m < cellStart[k + 1]; m++) {
            const d = dotIdx[m]
            if (dstamp[d] === frame) continue
            dstamp[d] = frame
            const dx = dots.x[d]
            const dy = dots.y[d]
            let t = 0
            let cm = 0
            for (const L of active) {
              const dist = Math.hypot(dx - L.x, dy - L.y)
              if (dist >= L.r) continue
              t = Math.max(t, L.s * (1 - sstep(L.r * 0.5, L.r, dist)))
              if (L.core > 0) {
                // the photo's opacity here (same curve as its gradient): the dots take the rest, a true cross-dissolve
                cm = Math.max(cm, L.core * L.s * coreAlpha(dist / (L.r * PORTRAIT.core)))
              }
            }
            // inside a disc the global reveal was cleared with the field: keep it, so there is no ring at the edge
            const v = Math.max(t, reveal) * (1 - cm)
            if (v > 0.01) drawCell(ctx, dx, dy, dots.tone[d], v, f.dpr, f.dotPitch)
          }
        }
      }
    }

    // colour core: the cutout photo through a radial mask, source-over, after the dots
    const { cutout, tmp } = core
    if (cutout) {
      const tc = tmp.getContext("2d")
      if (tc) {
        for (const l of active) {
          const rc = l.r * PORTRAIT.core
          if (l.core <= 0 || rc < 2) continue
          if (l.x + rc < rect.x || l.x - rc > rect.x + rect.w || l.y + rc < rect.y || l.y - rc > rect.y + rect.h)
            continue
          const side = Math.ceil(2 * rc * f.dpr)
          if (tmp.width < side || tmp.height < side) tmp.width = tmp.height = side // grow only (a fresh canvas is 300x150)
          tc.setTransform(1, 0, 0, 1, 0, 0)
          tc.globalCompositeOperation = "source-over"
          tc.clearRect(0, 0, tmp.width, tmp.height)
          tc.setTransform(f.dpr, 0, 0, f.dpr, -(l.x - rc) * f.dpr, -(l.y - rc) * f.dpr)
          tc.drawImage(cutout, rect.x, rect.y, rect.w, rect.h)
          tc.globalCompositeOperation = "destination-in"
          const g = tc.createRadialGradient(l.x, l.y, 0, l.x, l.y, rc)
          g.addColorStop(0, "#000")
          for (const [at, a] of CORE_STOPS) g.addColorStop(at, `rgba(0,0,0,${a})`)
          tc.fillStyle = g
          tc.fillRect(l.x - rc, l.y - rc, side / f.dpr, side / f.dpr)
          tc.globalCompositeOperation = "source-over"
          ctx.globalCompositeOperation = "source-over"
          ctx.globalAlpha = l.s * l.core
          ctx.drawImage(tmp, 0, 0, side, side, l.x - rc, l.y - rc, side / f.dpr, side / f.dpr)
          ctx.globalAlpha = 1
        }
      }
    }
  }
  ctx.restore()
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1
}

export function HeroField() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return // jsdom / no canvas support: keep the CSS dot texture
    const hero = (wrap.closest("section") ?? wrap.parentElement) as HTMLElement
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
    const uvVar = getComputedStyle(document.documentElement).getPropertyValue("--uv-rgb").trim()
    const uv = uvVar ? uvVar.split(/\s+/).join(",") : "148,105,255"
    const lampOn = () => document.documentElement.dataset.lamp === "on"
    let onIntroEnd: (() => void) | null = null
    let onIntroGo: (() => void) | null = null
    let onHandOff: (() => void) | null = null

    let field: Field | null = null
    let sc = scratchFor(0)
    let frame = 0
    let raf = 0
    let last = 0
    let visible = true
    let disposed = false
    let started = false
    let resizeTimer = 0
    let bloomTimer = 0
    let size = ""
    let dprQuery: MediaQueryList | null = null
    const lens = { x: 0, y: 0, tx: 0, ty: 0, s: 0, target: 0, r: 150 }
    const bloom = {
      on: false,
      t0: 0,
      x: 0,
      y: 0,
      rmax: 0,
      grow: BLOOM_GROW,
      hold: BLOOM_HOLD,
      fade: BLOOM_FADE,
      core: 0,
    }
    let bloomLamp: Lamp | null = null
    const core: Core = { cutout: null, tmp: document.createElement("canvas") }
    let img: HTMLImageElement | null = null
    let imgReady = false
    let matte: HTMLCanvasElement | null = null
    // dev only (tree-shaken from production): keep the portrait rect and the cutout outlined at 35%
    const debug = process.env.NODE_ENV !== "production" && location.search.includes("debug=portrait")

    // draw() skips a frame identical to the last one (the hand-off's hold is ~700ms of the same image): `ver` moves
    // whenever the field or the cutout is rebuilt, the rest of the key is every input a frame depends on
    let ver = 0
    let lastKey = ""

    // Bakes the colour cutout once the photo is decoded and a portrait rect exists (also after every rebuild).
    const bake = () => {
      ver++
      core.cutout = null
      if (!imgReady || !img || !field?.rect) return
      matte ??= matteCanvas()
      if (matte) core.cutout = bakeCutout(img, field.rect, field.dpr, matte)
    }

    const draw = () => {
      if (!field) return
      const bl = bloomLamp
      const key = `${ver}|${lens.s}|${lens.x}|${lens.y}|${bl ? `${bl.x},${bl.y},${bl.r},${bl.s},${bl.core}` : ""}|${lampOn()}|${reduce.matches}`
      if (key === lastKey) return
      lastKey = key
      frame = (frame + 1) >>> 0 || 1
      const lamps: Lamp[] = []
      if (lens.s > 0.002) lamps.push({ x: lens.x, y: lens.y, r: lens.r, s: lens.s, core: 1 })
      if (bloomLamp) lamps.push(bloomLamp)
      const portrait = field.mode === "portrait"
      const reveal = lampOn() ? 0.6 : reduce.matches ? (portrait ? 0.3 : 0.45) : portrait ? GHOST : 0
      render(ctx, field, lamps, reveal, uv, sc, frame, core)
      if (debug && field.rect) {
        const { rect } = field
        ctx.setTransform(field.dpr, 0, 0, field.dpr, 0, 0)
        ctx.globalAlpha = 0.35
        if (core.cutout) ctx.drawImage(core.cutout, rect.x, rect.y, rect.w, rect.h)
        ctx.strokeStyle = "#f0f"
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
        ctx.globalAlpha = 1
      }
    }

    const tick = (now: number) => {
      raf = 0
      const dt = last ? Math.min(64, now - last) : 16.7
      last = now
      const k = 1 - Math.pow(0.8, dt / 16.7) // lerp .2 per 60Hz frame, frame-rate independent
      lens.x += (lens.tx - lens.x) * k
      lens.y += (lens.ty - lens.y) * k
      if (lens.s < lens.target) lens.s = Math.min(lens.target, lens.s + dt / 300)
      else if (lens.s > lens.target) lens.s = Math.max(lens.target, lens.s - dt / 400)
      bloomLamp = null
      if (bloom.on) {
        const e = now - bloom.t0
        const { x, y, rmax, grow, hold, fade, core: c } = bloom
        if (e < grow) bloomLamp = { x, y, r: rmax * easeOut(e / grow), s: 1, core: c }
        else if (e < grow + hold) bloomLamp = { x, y, r: rmax, s: 1, core: c }
        else if (e < grow + hold + fade)
          bloomLamp = { x, y, r: rmax, s: 1 - easeInOut((e - grow - hold) / fade), core: c }
        else bloom.on = false
      }
      draw()
      const moving = Math.abs(lens.tx - lens.x) + Math.abs(lens.ty - lens.y) > 0.3 || lens.s !== lens.target
      if (moving || bloom.on) raf = requestAnimationFrame(tick)
      else last = 0 // idle: no frames scheduled
    }
    const kick = () => {
      if (!raf && field && visible && !document.hidden && !reduce.matches && !disposed)
        raf = requestAnimationFrame(tick)
    }
    const halt = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
      last = 0
    }
    const startBloom = (x: number, y: number, rmax: number, o: BloomOpts = {}) => {
      bloom.grow = o.grow ?? BLOOM_GROW
      bloom.hold = o.hold ?? BLOOM_HOLD
      bloom.fade = o.fade ?? BLOOM_FADE
      bloom.core = o.core ?? 0
      bloom.on = true
      bloom.t0 = performance.now()
      bloom.x = x
      bloom.y = y
      bloom.rmax = rmax
      window.dispatchEvent(new Event("mm:field-bloom"))
      kick()
    }

    const rebuild = (force = false) => {
      const dims = heroSize(wrap)
      const key = `${dims.w}x${dims.h}@${window.devicePixelRatio}`
      if (key === size && field && !force) return // ResizeObserver's initial callback, or a no-op resize
      size = key
      const layout = heroLayout(hero, wrap, dims)
      field = buildField(layout.w, layout.h, layout.mobile, layout)
      ver++
      wrap.dataset.mode = field?.mode ?? "none"
      if (!field) return
      bake()
      canvas.width = field.base.width
      canvas.height = field.base.height
      sc = scratchFor(field.cols * field.rows, field.dots.x.length)
      frame = 0
      lens.r = window.innerWidth < 1280 ? 120 : 150
      draw()
      watchDpr()
    }

    // DPR changes (window dragged to another display) do not resize the box: watch the resolution query.
    const onDpr = () => rebuild(true)
    const watchDpr = () => {
      dprQuery?.removeEventListener("change", onDpr)
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      dprQuery.addEventListener("change", onDpr)
    }

    const local = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientY - r.top <= r.height }
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !fine.matches || reduce.matches) return
      const p = local(e)
      if (lens.s === 0 && lens.target === 0) {
        lens.x = p.x
        lens.y = p.y
      }
      lens.tx = p.x
      lens.ty = p.y
      lens.target = 1
      kick()
    }
    const onLeave = () => {
      if (lens.target === 0) return
      lens.target = 0
      kick()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || reduce.matches) return
      if ((e.target as Element | null)?.closest("a,button")) return
      const p = local(e)
      if (p.inside) startBloom(p.x, p.y, field?.rect ? Math.max(140, 0.45 * field.rect.h) : 140, { core: 1 })
    }
    const onVisibility = () => (document.hidden ? halt() : kick())
    const onReduce = () => {
      halt()
      bloom.on = false
      bloomLamp = null
      lens.s = lens.target = 0
      draw()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (!visible) halt()
      else kick()
    })
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => rebuild(), 150)
    })

    const init = () => {
      if (disposed || started) return
      started = true
      const fontsLoaded = !document.fonts || document.fonts.status === "loaded"
      rebuild()
      if (!field) return // canvas unavailable: the CSS dots stay
      if (!fontsLoaded) {
        // Init ran on the stall cap, with fallback metrics: the copy boxes (so the portrait) can differ once the web fonts
        // land. Place it again then, but only if the rect really moved (the usual case is that it did not).
        const settle = () => {
          if (disposed || !field) return
          const L = heroLayout(hero, wrap)
          const r = placePortrait(L)
          const o = field.rect
          if (
            !!r !== !!o ||
            (r && o && (Math.abs(r.x - o.x) > 0.5 || Math.abs(r.y - o.y) > 0.5 || Math.abs(r.h - o.h) > 0.5))
          )
            rebuild(true)
        }
        document.fonts.ready.then(settle, () => {})
      }
      wrap.dataset.ready = "true"
      io.observe(wrap)
      ro.observe(wrap)
      hero.addEventListener("pointermove", onMove, { passive: true })
      hero.addEventListener("pointerleave", onLeave, { passive: true })
      hero.addEventListener("pointerdown", onDown, { passive: true })
      document.addEventListener("visibilitychange", onVisibility)
      reduce.addEventListener("change", onReduce)
      window.addEventListener("mm:lamp", draw)
      if (!reduce.matches) {
        let bloomed = false
        // The hand-off: a portrait-wide bloom with the colour core, so the page under the clearing overlay already shows
        // her photo, which then fades to the halftone and the resting ghost. Reads the field at fire time (a resize
        // during the intro rebuilds it).
        const go = (o: BloomOpts) => () => {
          if (bloomed || disposed || !field) return
          bloomed = true
          startBloom(field.centreX, field.centreY, field.bloomR, o)
        }
        const intro = (window as Window & { __mmIntro?: { mode: "full" | "short"; tGo?: number; aborted?: number } })
          .__mmIntro
        const state = document.documentElement.dataset.intro
        if (intro && (state === "full" || state === "short")) {
          // The sequence's clock starts at go (IntroStage: fonts, portrait and layout ready), possibly after this init:
          // arm the hand-off then, on the CSS clock (the mode may have switched full -> short at go).
          const arm = () => {
            window.removeEventListener("mm:intro-go", arm)
            if (bloomed || disposed) return
            const m = document.documentElement.dataset.intro
            if (m !== "full" && m !== "short") return
            const handOff = go({ grow: 0, hold: INTRO[m].collapseDur + 100, fade: 1000, core: 1 })
            const at = introClock(intro.tGo ?? performance.now()) + INTRO[m].collapse // blooms as the ink clears
            bloomTimer = window.setTimeout(handOff, Math.max(0, at - performance.now()))
            onHandOff = handOff // a skip blooms at once
          }
          // an abort (no go by the budget) blooms like a visit without an intro: the plain halftone, the ink fading out above
          const plain = go({ core: 0 })
          onIntroEnd = () => (intro.aborted ? plain : (onHandOff ?? plain))()
          window.addEventListener("mm:intro-end", onIntroEnd, { once: true })
          if (document.documentElement.hasAttribute("data-intro-go")) arm()
          else {
            onIntroGo = arm
            window.addEventListener("mm:intro-go", arm)
          }
        } else {
          // after the 600ms canvas fade-in has mostly landed
          bloomTimer = window.setTimeout(go({ core: 0 }), 650)
        }
      }
    }

    // The colour photo loads at mount (not at init); no core if it cannot decode (the halftone alone still works).
    {
      const im = new Image()
      im.decoding = "async"
      const ready = () => {
        if (disposed || imgReady) return
        imgReady = true
        img = im
        bake()
        draw()
      }
      im.onload = ready
      im.src = photos.portrait.img.src
      im.decode?.().then(ready, () => {})
    }

    // After first paint, fonts (the mark avoids the h1, whose width depends on Hubot) and an idle slot.
    let idleId = 0
    let timeoutId = 0
    const schedule = () => {
      if (disposed || started || idleId || timeoutId) return // once: fonts.ready or the stall fallback below
      const intro = document.documentElement.dataset.intro
      if (intro === "full" || intro === "short") {
        // the intro is running: be ready under the overlay (the hand-off blooms at `collapse`), but in an idle slot of its
        // own, never inside the font callbacks next to hydration and the overlay's own prep
        // (the idle timeout is a cap from now; before go IntroStage is busy with its own prep, and init arms the hand-off
        // to the go signal itself, so it can never miss it)
        const wait = Math.max(120, INTRO[intro].collapse - 700)
        if (typeof window.requestIdleCallback === "function")
          idleId = window.requestIdleCallback(init, { timeout: wait })
        else timeoutId = window.setTimeout(init, 60)
        return
      }
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(init, { timeout: 800 })
      else timeoutId = window.setTimeout(init, 200)
    }
    if (document.fonts?.ready) document.fonts.ready.then(schedule, schedule)
    else schedule()
    // fonts.ready can stall (a font request that never settles): init anyway; init itself runs once
    const fontsTimer = window.setTimeout(schedule, 3000)

    return () => {
      disposed = true
      if (idleId) window.cancelIdleCallback(idleId)
      window.clearTimeout(timeoutId)
      window.clearTimeout(fontsTimer)
      window.clearTimeout(resizeTimer)
      window.clearTimeout(bloomTimer)
      halt()
      io.disconnect()
      ro.disconnect()
      dprQuery?.removeEventListener("change", onDpr)
      hero.removeEventListener("pointermove", onMove)
      hero.removeEventListener("pointerleave", onLeave)
      hero.removeEventListener("pointerdown", onDown)
      document.removeEventListener("visibilitychange", onVisibility)
      reduce.removeEventListener("change", onReduce)
      window.removeEventListener("mm:lamp", draw)
      if (onIntroEnd) window.removeEventListener("mm:intro-end", onIntroEnd)
      if (onIntroGo) window.removeEventListener("mm:intro-go", onIntroGo)
    }
  }, [])

  return (
    <div ref={wrapRef} className="hero-field" aria-hidden="true" data-ready="false">
      <canvas ref={canvasRef} />
    </div>
  )
}
