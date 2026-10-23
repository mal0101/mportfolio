"use client"

import { useEffect, useRef } from "react"

/*
 * The UV lamp (DESIGN §5.11, MASTER-PLAN §7.3). A microprint field of short dashes with the M. mark hidden in
 * its "low bits": payload cells are drawn exactly like their neighbours until a lamp passes over them.
 * Renders on demand only: no animation frame is scheduled while nothing changes, and none while the hero is
 * off-screen or the tab is hidden. Under reduced motion it draws one static frame with the mark at 45%.
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
  markX: number
  markY: number
  markR: number
}
type Lamp = { x: number; y: number; r: number; s: number }
type Box = { l: number; t: number; r: number; b: number }

const MARK_PATH = "M12 86 V16 L46 58 L80 16 V86" // same as components/ui/mark.tsx (viewBox 120x100)
const PAPER = "rgb(239,237,245)"

// Visual knobs (frozen after Phase 5 visual QA).
const PITCH = 12 // cell size, px (10 below 768)
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

/** Text boxes inside the hero copy, relative to the field, so the mark is placed in clear space. */
function textBoxes(hero: HTMLElement, origin: DOMRect, pad: number): Box[] {
  const inner = hero.querySelector(".hero-inner")
  if (!inner) return []
  const out: Box[] = []
  // inset (em): a text box spans the font's whole content area (~1.4em in Hubot), well beyond the glyphs
  const add = (r: DOMRect, fs = 0) => {
    if (r.width && r.height)
      out.push({
        l: r.left - origin.left - pad,
        t: r.top + fs * 0.3 - origin.top - pad,
        r: r.right - origin.left + pad,
        b: r.bottom - fs * 0.25 - origin.top + pad,
      })
  }
  const range = document.createRange()
  const walker = document.createTreeWalker(inner, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue
    range.selectNodeContents(n)
    const fs = n.parentElement ? parseFloat(getComputedStyle(n.parentElement).fontSize) || 0 : 0
    for (const r of range.getClientRects()) add(r, fs)
  }
  inner.querySelectorAll(".full-stop, .pill, .hero-photo").forEach((el) => add(el.getBoundingClientRect()))
  return out
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

function buildField(w: number, h: number, mobile: boolean, mark: { x: number; y: number; s: number }): Field | null {
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)
  const pitch = mobile ? 10 : PITCH
  const cols = Math.ceil(w / pitch)
  const rows = Math.ceil(h / pitch)
  const n = cols * rows

  // 1. rasterise the mark into a cell-resolution mask (the hidden "low bits")
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
  const md = m.getImageData(0, 0, cols, rows).data

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
      if (md[k * 4 + 3] > 127) {
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
    markX: mark.x,
    markY: mark.y,
    markR: mark.s * 0.78,
  }
}

/** Reusable per-frame scratch buffers (sized to the field). */
type Scratch = { stamp: Uint32Array; cell: Uint32Array; lit: Float32Array; order: Uint32Array; count: Uint32Array }
const scratchFor = (n: number): Scratch => ({
  stamp: new Uint32Array(n),
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
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = "source-over"
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.drawImage(f.base, 0, 0)
  ctx.setTransform(f.dpr, 0, 0, f.dpr, 0, 0)

  // reduced motion: the mark is shown statically, quiet
  if (reveal > 0) {
    ctx.globalCompositeOperation = "lighter"
    ctx.fillStyle = `rgb(${uv})`
    for (const k of f.payloadIdx) square(ctx, f, k, reveal)
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
        const level = Math.round((f.payload[k] ? a * (1 - t) : a) * (LEVELS / A_LIT))
        order[n] = Math.min(LEVELS, level)
        count[order[n]]++
        n++
      }
    }
  }

  // lit dashes: comb flat and brighten (payload dashes fade out as their squares appear); one stroke per level
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

  // payload: UV squares with a soft halo (two squares, additive, no shadowBlur)
  ctx.globalCompositeOperation = "lighter"
  ctx.fillStyle = `rgb(${uv})`
  for (let q = 0; q < n; q++) {
    const k = cell[q]
    if (f.payload[k] && lit[q] > 0.01) square(ctx, f, k, lit[q])
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
    const bloom = { on: false, t0: 0, x: 0, y: 0, rmax: 0 }
    let bloomLamp: Lamp | null = null

    const draw = () => {
      if (!field) return
      frame = (frame + 1) >>> 0 || 1
      const lamps: Lamp[] = []
      if (lens.s > 0.002) lamps.push({ x: lens.x, y: lens.y, r: lens.r, s: lens.s })
      if (bloomLamp) lamps.push(bloomLamp)
      render(ctx, field, lamps, reduce.matches ? 0.45 : 0, uv, sc, frame)
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
        const { x, y, rmax } = bloom
        if (e < BLOOM_GROW) bloomLamp = { x, y, r: rmax * easeOut(e / BLOOM_GROW), s: 1 }
        else if (e < BLOOM_GROW + BLOOM_HOLD) bloomLamp = { x, y, r: rmax, s: 1 }
        else if (e < BLOOM_GROW + BLOOM_HOLD + BLOOM_FADE)
          bloomLamp = { x, y, r: rmax, s: 1 - easeInOut((e - BLOOM_GROW - BLOOM_HOLD) / BLOOM_FADE) }
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
    const startBloom = (x: number, y: number, rmax: number) => {
      bloom.on = true
      bloom.t0 = performance.now()
      bloom.x = x
      bloom.y = y
      bloom.rmax = rmax
      kick()
    }

    const rebuild = () => {
      const r = wrap.getBoundingClientRect()
      const w = Math.max(1, Math.round(r.width))
      const h = Math.max(1, Math.round(r.height))
      const mobile = window.innerWidth < 768
      const key = `${w}x${h}@${window.devicePixelRatio}`
      if (key === size && field) return // ResizeObserver's initial callback, or a no-op resize
      size = key
      const inner = hero.querySelector(".hero-inner")
      const innerRect = inner?.getBoundingClientRect()
      const padR = inner ? parseFloat(getComputedStyle(inner).paddingRight) || 0 : 0
      const right = innerRect ? innerRect.right - padR - r.left : w * 0.94
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 64
      const mark = placeMark(w, h, mobile, navH + (mobile ? 20 : 36), right, textBoxes(hero, r, mobile ? 16 : 28))
      field = buildField(w, h, mobile, mark)
      if (!field) return
      canvas.width = field.base.width
      canvas.height = field.base.height
      sc = scratchFor(field.cols * field.rows)
      frame = 0
      lens.r = window.innerWidth < 1280 ? 120 : 150
      draw()
      watchDpr()
    }

    // DPR changes (window dragged to another display) do not resize the box: watch the resolution query.
    const onDpr = () => rebuild()
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
      if (p.inside) startBloom(p.x, p.y, 140)
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
      resizeTimer = window.setTimeout(rebuild, 150)
    })

    const init = () => {
      if (disposed || started) return
      started = true
      rebuild()
      if (!field) return // canvas unavailable: the CSS dots stay
      wrap.dataset.ready = "true"
      io.observe(wrap)
      ro.observe(wrap)
      hero.addEventListener("pointermove", onMove, { passive: true })
      hero.addEventListener("pointerleave", onLeave, { passive: true })
      hero.addEventListener("pointerdown", onDown, { passive: true })
      document.addEventListener("visibilitychange", onVisibility)
      reduce.addEventListener("change", onReduce)
      if (!reduce.matches) {
        const f = field
        // after the 600ms canvas fade-in has mostly landed
        bloomTimer = window.setTimeout(() => startBloom(f.markX, f.markY, f.markR * 1.35), 650)
      }
    }

    // After first paint, fonts (the mark avoids the h1, whose width depends on Hubot) and an idle slot.
    let idleId = 0
    let timeoutId = 0
    const schedule = () => {
      if (disposed) return
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(init, { timeout: 800 })
      else timeoutId = window.setTimeout(init, 200)
    }
    if (document.fonts?.ready) document.fonts.ready.then(schedule, schedule)
    else schedule()

    return () => {
      disposed = true
      if (idleId) window.cancelIdleCallback(idleId)
      window.clearTimeout(timeoutId)
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
    }
  }, [])

  return (
    <div ref={wrapRef} className="hero-field" aria-hidden="true" data-ready="false">
      <canvas ref={canvasRef} />
    </div>
  )
}
