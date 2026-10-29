// The hero portrait (DESIGN §5.11): baked tones, placement, the fine dot grid, the field mask and the square drawing shared by the hero
// field and the intro. Pure module: no DOM access at import time.
import { TONES } from "@/lib/portrait-tones"

export type Rect = { x: number; y: number; w: number; h: number }
/** Box edges, relative to the field. */
export type Box = { l: number; t: number; r: number; b: number }

/**
 * core: colour-core radius as a fraction of the lamp radius. coreFlat: the fraction of that radius where the photo is
 * fully opaque (true colour, no dots); from there to the core edge photo and halftone cross-dissolve on one smoothstep.
 */
export const PORTRAIT = {
  maxUpscale: 1.5,
  minH: 160,
  aspect: 0.8,
  payloadMin: 0.06,
  core: 0.7,
  coreFlat: 0.5,
  halo: 0.12,
} as const

/** Photo opacity at distance fraction f (0..1) of the core radius: 1 on the plateau, smoothstep to 0 at the edge. */
export function coreAlpha(f: number) {
  const x = Math.min(1, Math.max(0, (f - PORTRAIT.coreFlat) / (1 - PORTRAIT.coreFlat)))
  return 1 - x * x * (3 - 2 * x)
}

export function mulberry32(seed: number) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let decoded: { lum: Float32Array; matte: Float32Array } | null = null

/** Unpacks TONES: high nibble luminance, low nibble matte, both 0..1. Memoised. */
export function decodeTones() {
  if (decoded) return decoded
  const { gw, gh, data } = TONES
  const bin = atob(data)
  if (bin.length !== gw * gh) throw new Error(`portrait tones: expected ${gw * gh} samples, got ${bin.length}`)
  const lum = new Float32Array(bin.length)
  const matte = new Float32Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    const b = bin.charCodeAt(i)
    lum[i] = (b >> 4) / 15
    matte[i] = (b & 15) / 15
  }
  return (decoded = { lum, matte })
}

/**
 * Positive image with an S-curve: bright skin and collar give big squares, dark hair stays small, and the mid-tone
 * features (eyes, brows, nostrils, lips) are pushed apart from the skin around them. 0 below 0.08.
 */
export const curve = (L: number) => {
  if (L < 0.08) return 0
  const x = (L - 0.08) / 0.92
  return 0.12 + 0.88 * x * x * (3 - 2 * x)
}

/** Bilinear sample of a TONES channel at (u, v) in 0..1 (clamped to the grid edge). */
function sample(a: Float32Array, u: number, v: number): number {
  const { gw, gh } = TONES
  const x = Math.min(gw - 1, Math.max(0, u * gw - 0.5))
  const y = Math.min(gh - 1, Math.max(0, v * gh - 0.5))
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = Math.min(gw - 1, x0 + 1)
  const y1 = Math.min(gh - 1, y0 + 1)
  const fx = x - x0
  const fy = y - y0
  return (
    (a[y0 * gw + x0] * (1 - fx) + a[y0 * gw + x1] * fx) * (1 - fy) +
    (a[y1 * gw + x0] * (1 - fx) + a[y1 * gw + x1] * fx) * fy
  )
}

const inside = (u: number, v: number) => u >= 0 && u <= 1 && v >= 0 && v <= 1

/** Bilinear tone at (u, v) in 0..1 across the portrait: matte times curved luminance. 0 outside the image. */
export function toneAt(u: number, v: number): number {
  if (!inside(u, v)) return 0
  const { lum, matte } = decodeTones()
  return sample(matte, u, v) * curve(sample(lum, u, v))
}

/** Bilinear matte (silhouette coverage) at (u, v). 0 outside the image. */
export function matteAt(u: number, v: number): number {
  return inside(u, v) ? sample(decodeTones().matte, u, v) : 0
}

type PortraitLayout = {
  w: number
  h: number
  mobile: boolean
  dpr: number
  top: number
  right: number
  boxes: Box[]
  pitch: number
}

/**
 * Largest 4:5 box right-aligned to the content edge, below the nav, clear of the hero copy and above the bottom mask
 * fade. Capped so the colour core is never upscaled past 1.5x the source (469px at DPR 2). Null if nothing fits
 * (the hero then keeps the M).
 */
export function placePortrait(L: PortraitLayout): Rect | null {
  const { w, h, mobile, dpr, top, right, boxes, pitch } = L
  const maxH = Math.min(h * (mobile ? 0.72 : 0.78), (PORTRAIT.maxUpscale * TONES.srcH) / dpr)
  const floor = h * (mobile ? 0.7 : 0.72)
  for (let ph = maxH; ph >= PORTRAIT.minH; ph *= 0.95) {
    const pw = ph * PORTRAIT.aspect
    const x = right - pw
    if (mobile ? pw > w * 0.62 : x < w * 0.58) continue
    // clear band above the first box overlapping this column span
    let lim = floor
    for (const b of boxes) if (b.r > x && b.l < right && b.b > top) lim = Math.min(lim, b.t)
    const band = lim - top
    if (band < ph) continue
    const sx = Math.round(x / pitch) * pitch
    const sy = Math.round((top + (band - ph) / 2) / pitch) * pitch
    if (sy < top || sy + ph > floor || (!mobile && sx < w * 0.58)) continue
    if (boxes.some((b) => b.r > sx && b.l < sx + pw && b.b > sy && b.t < sy + ph)) continue
    return { x: sx, y: sy, w: pw, h: ph }
  }
  return null
}

/** Portrait dot pitch: half the field pitch, so four dots sit symmetrically inside every field cell. */
export const dotPitchFor = (pitch: number) => pitch / 2

/**
 * The portrait's own fine dot grid, independent of the field's dash cells. Dot centres are snapped to the field-wide
 * grid (k + 0.5) * dotPitch, relative to the field origin; each tone is the mean of a 3x3 sub-sample over the dot's
 * footprint. Only dots above payloadMin are returned, in row-major order. Deterministic.
 */
export function portraitDots(rect: Rect, dotPitch: number) {
  // HeroField and the intro both ask for the same grid at start-up: compute it once (callers only read it)
  const key = `${rect.x},${rect.y},${rect.w},${rect.h},${dotPitch}`
  if (dotsMemo?.key === key) return dotsMemo.out
  const out = computeDots(rect, dotPitch)
  dotsMemo = { key, out }
  return out
}

let dotsMemo: { key: string; out: ReturnType<typeof computeDots> } | null = null

function computeDots(rect: Rect, dotPitch: number) {
  const i0 = Math.ceil(rect.x / dotPitch - 0.5)
  const i1 = Math.floor((rect.x + rect.w) / dotPitch - 0.5)
  const j0 = Math.ceil(rect.y / dotPitch - 0.5)
  const j1 = Math.floor((rect.y + rect.h) / dotPitch - 0.5)
  const xs: number[] = []
  const ys: number[] = []
  const ts: number[] = []
  const q = dotPitch / 3
  for (let j = j0; j <= j1; j++) {
    const cy = (j + 0.5) * dotPitch
    for (let i = i0; i <= i1; i++) {
      const cx = (i + 0.5) * dotPitch
      let s = 0
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) s += toneAt((cx + dx * q - rect.x) / rect.w, (cy + dy * q - rect.y) / rect.h)
      const t = s / 9
      if (t <= PORTRAIT.payloadMin) continue
      xs.push(cx)
      ys.push(cy)
      ts.push(t)
    }
  }
  return { x: Float32Array.from(xs), y: Float32Array.from(ys), tone: Float32Array.from(ts) }
}

/**
 * Per-field-cell silhouette coverage (0..1, mean of a 2x2 sub-sample of the matte), row-major cols x rows. P2 fades
 * the field's dashes under the portrait by this when lit, so dashes and dots do not fight.
 */
export function payloadMask(rect: Rect, pitch: number, cols: number, rows: number) {
  const out = new Float32Array(cols * rows)
  const q = pitch / 4
  const i0 = Math.max(0, Math.floor(rect.x / pitch))
  const i1 = Math.min(cols - 1, Math.floor((rect.x + rect.w) / pitch))
  const j0 = Math.max(0, Math.floor(rect.y / pitch))
  const j1 = Math.min(rows - 1, Math.floor((rect.y + rect.h) / pitch))
  for (let j = j0; j <= j1; j++)
    for (let i = i0; i <= i1; i++) {
      const cx = i * pitch + pitch / 2
      const cy = j * pitch + pitch / 2
      let s = 0
      for (const dy of [-q, q])
        for (const dx of [-q, q]) s += matteAt((cx + dx - rect.x) / rect.w, (cy + dy - rect.y) / rect.h)
      out[j * cols + i] = s / 4
    }
  return out
}

/** Square side for a dot: grows with tone, never touching its neighbour (capped at dotPitch - 1). */
export const squareSize = (tone: number, dotPitch: number) => Math.min(dotPitch - 1, 0.6 + tone * dotPitch * 0.8)
export const squareAlpha = (tone: number) => 0.55 + 0.45 * tone

/** One portrait dot at (x, y): a soft halo then the square core, snapped to device pixels. */
export function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tone: number,
  t: number,
  dpr: number,
  dotPitch: number,
) {
  const size = squareSize(tone, dotPitch)
  const px = (v: number) => Math.round(v * dpr) / dpr
  const halo = size + 2
  ctx.globalAlpha = PORTRAIT.halo * t * tone
  ctx.fillRect(px(x - halo / 2), px(y - halo / 2), halo, halo)
  ctx.globalAlpha = t * squareAlpha(tone)
  ctx.fillRect(px(x - size / 2), px(y - size / 2), size, size)
}

/** The matte (120x150, alpha = matte) as a canvas, built once; upscaled with smoothing it feathers the cutout edge. */
export function matteCanvas() {
  if (matteMemo) return matteMemo
  const { gw, gh } = TONES
  const c = document.createElement("canvas")
  c.width = gw
  c.height = gh
  const g = c.getContext("2d")
  if (!g) return null
  const { matte } = decodeTones()
  const id = g.createImageData(gw, gh)
  for (let i = 0; i < matte.length; i++) {
    id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = 255
    id.data[i * 4 + 3] = Math.round(matte[i] * 255)
  }
  g.putImageData(id, 0, 0)
  return (matteMemo = c)
}
let matteMemo: HTMLCanvasElement | null = null

/** The photo scaled to the portrait rect, keyed out by the upscaled matte (no ctx.filter: Safari). Shared with the intro. */
export function bakeCutout(img: HTMLImageElement, rect: Rect, dpr: number, matte: HTMLCanvasElement) {
  // one bake serves both canvases (the intro and HeroField draw the same cutout at the same size; neither mutates it).
  // Keyed by the photo's URL, not the element: each side decodes its own Image of the same file.
  const w = Math.round(rect.w * dpr)
  const h = Math.round(rect.h * dpr)
  const src = img.currentSrc || img.src
  if (cutMemo && cutMemo.src === src && cutMemo.w === w && cutMemo.h === h && cutMemo.matte === matte) return cutMemo.c
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const g = c.getContext("2d")
  if (!g) return null
  g.imageSmoothingEnabled = true
  g.imageSmoothingQuality = "high"
  g.drawImage(img, 0, 0, c.width, c.height)
  g.globalCompositeOperation = "destination-in"
  g.drawImage(matte, 0, 0, c.width, c.height)
  // the photo is cropped mid-torso: feather its bottom edge so a lens over the collar does not show a hard line
  const fade = g.createLinearGradient(0, c.height * 0.88, 0, c.height)
  fade.addColorStop(0, "rgba(0,0,0,0)")
  fade.addColorStop(1, "#000")
  g.globalCompositeOperation = "destination-out"
  g.fillStyle = fade
  g.fillRect(0, c.height * 0.88, c.width, c.height * 0.12)
  cutMemo = { src, w, h, matte, c }
  return c
}
let cutMemo: { src: string; w: number; h: number; matte: HTMLCanvasElement; c: HTMLCanvasElement } | null = null

/** Tests only: forget the memoised dots, matte and cutout (each test fakes its own canvas and photo). */
export function resetPortraitMemo() {
  dotsMemo = null
  matteMemo = null
  cutMemo = null
}
