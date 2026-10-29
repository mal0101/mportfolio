"use client"

import { useEffect } from "react"
import { photos } from "@/data/photos"
import { chapters } from "@/data/story"
import { fieldDpr, heroPortrait } from "@/lib/hero-layout"
import { INTRO, easeAt, introClock, particleAt, smooth01, tintAt, type IntroMode, type Particle } from "@/lib/intro"
import { bakeCutout, drawCell, matteCanvas, mulberry32, type Rect } from "@/lib/portrait"

/*
 * The canvas half of the opening, "Exposure" (DESIGN §6.1). Renders nothing itself: it draws on the overlay's <canvas>.
 * Every visual is a pure function of elapsed = performance.now() - introClock(), the CSS timeline's start, so the canvas
 * and the CSS reel/collapse share one clock and a late hydration just catches up.
 *   0-700   a dash field drifts on a value-noise flow field and cross-dissolves into each year's ink as the reel rolls
 *   700-1750  dashes fade in and fly (eased in and out, curved paths, bright tones first) to the portrait's dots and
 *             become UV squares: her face develops
 *   1750-2150 the real photo develops over the rect from the face outward (a smooth ramp, not a pop)
 * The whole canvas fades in over 280ms from its first drawn frame, so a late hydration never pops the dashes in.
 *   2150-2750 the hand-off: ink + reel clear (CSS), the dashes fade here, the overlay portrait crossfades into the page's own
 *             (HeroField blooms its colour core at the same instant) and a UV square (CSS) flies to the hero full stop
 * The dots use heroPortrait(), the same function HeroField's layout is built from, so they land on the hero's own dots.
 */

type Boot = { mode: IntroMode; t0: number; end?: () => void }
const TAU = Math.PI * 2
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)
const smooth = (t: number) => t * t * (3 - 2 * t)
const sstep = (a: number, b: number, x: number) => smooth(clamp01((x - a) / (b - a)))

function hash2(x: number, y: number, seed: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
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

const A_MIN = 0.07 // daylight dash alpha, as the hero field
const A_SPAN = 0.18
const Q = 4 // alpha buckets
const MORPH = 140 // dash -> square, ms
const LAUNCH = 120 // a flying dash fades in over this long, ms
const CANVAS_IN = 280 // the canvas fades in from its first drawn frame, ms
const DPR_CAP = 1.5 // the overlay canvas: a full-viewport raster, so capped (the cutout keeps the hero's sharpness)
const FACE = { u: 0.5, v: 0.4 } // where the exposure starts, as a fraction of the portrait rect

export function IntroStage() {
  useEffect(() => {
    const html = document.documentElement
    const mode = html.dataset.intro
    if (mode !== "full" && mode !== "short") return
    const canvas = document.querySelector<HTMLCanvasElement>(".intro canvas")
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return // jsdom / no canvas: the CSS reel and collapse still play
    const overlay = canvas.closest<HTMLElement>(".intro")
    const M = INTRO[mode]
    const boot = (window as Window & { __mmIntro?: Boot }).__mmIntro
    const boot0 = boot?.t0 ?? performance.now()
    let t0 = introClock(boot0)
    let synced = t0 !== boot0

    const css = getComputedStyle(html)
    const tok = (n: string) => css.getPropertyValue(n).trim()
    const rgb = (n: string, fb: string) => (tok(n) ? tok(n).split(/\s+/).join(",") : fb)
    const PAPER = `rgb(${rgb("--paper-rgb", "245,244,249")})`
    const UV = `rgb(${rgb("--uv-rgb", "148,105,255")})`
    const UV_RGB = rgb("--uv-rgb", "148,105,255")
    const inks = [...chapters.map((c) => tok(`--${c.ink}`) || PAPER), tok("--uv") || UV]
    const mono =
      (document.querySelector(".intro-cap") && getComputedStyle(document.querySelector(".intro-cap")!).fontFamily) ||
      "monospace"

    let dead = false
    let firstAt = -1 // when the first frame was drawn: the canvas fades in from there
    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    let cdpr = 1 // the cutout's own density: the hero's, so the photo is as sharp as the one it hands off to
    let resizeTimer = 0
    let stopTimer = 0
    // drifting dashes
    let dx0 = new Float32Array(0)
    let dy0 = new Float32Array(0)
    let dLen = new Float32Array(0)
    let dQ = new Uint8Array(0)
    let dH = new Float32Array(0)
    let seg = new Float32Array(0) // this frame's dash segments (x0, y0, x1, y1), reused by the tint pass
    let qStart = new Uint32Array(0) // dashes bucketed by alpha: qOrder[qStart[q]..qStart[q + 1]] are bucket q
    let qOrder = new Uint32Array(0)
    let subIdx = new Uint32Array(0) // the dashes that take each year's ink (a fixed half: no flicker as strength changes)
    let tc: CanvasRenderingContext2D | null = null
    // The landed UV squares are drawn once into this layer (rect-sized, additive) and blitted each frame: filling a
    // few thousand rects with "lighter" is the single costliest thing the canvas does (about 3x a source-over fill).
    const layer = document.createElement("canvas")
    let lg: CanvasRenderingContext2D | null = null
    let lx = 0
    let ly = 0
    let baked = new Uint8Array(0)
    // portrait
    let rect: Rect | null = null
    let parts: Particle[] = []
    let tones = new Float32Array(0)
    let plen = new Float32Array(0)
    let pang = new Float32Array(0)
    let dotPitch = 6
    let cutout: HTMLCanvasElement | null = null
    let img: HTMLImageElement | null = null
    const tmp = document.createElement("canvas")

    const size = () => {
      w = html.clientWidth
      h = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
      cdpr = fieldDpr(w < 768)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const pitch = 14
      const cols = Math.ceil(w / pitch)
      const rows = Math.ceil(h / pitch)
      const n = cols * rows
      dx0 = new Float32Array(n)
      dy0 = new Float32Array(n)
      dLen = new Float32Array(n)
      dQ = new Uint8Array(n)
      dH = new Float32Array(n)
      seg = new Float32Array(n * 4)
      const r = mulberry32(365)
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i
          dx0[k] = (i + 0.15 + r() * 0.7) * pitch
          dy0[k] = (j + 0.15 + r() * 0.7) * pitch
          const v = noise(dx0[k] * 0.0045, dy0[k] * 0.0045, 11)
          dLen[k] = 3 + v * 6
          dQ[k] = Math.min(Q - 1, Math.floor(v * v * Q))
          dH[k] = r()
        }
      qStart = new Uint32Array(Q + 1)
      for (let k = 0; k < n; k++) qStart[dQ[k] + 1]++
      for (let q = 0; q < Q; q++) qStart[q + 1] += qStart[q]
      qOrder = new Uint32Array(n)
      const fill = qStart.slice(0, Q)
      for (let k = 0; k < n; k++) qOrder[fill[dQ[k]]++] = k
      const sub: number[] = []
      for (let k = 0; k < n; k++) if (dH[k] < 0.5) sub.push(k)
      subIdx = Uint32Array.from(sub)
    }

    // drift of dash k at time e: a bounded wander along a smooth flow field that calms down as the dashes converge
    const amp = (e: number) => 26 * (1 - 0.65 * sstep(700, 1750, e))
    const dashAt = (k: number, e: number, out: number[]) => {
      const bx = dx0[k]
      const by = dy0[k]
      const ph = e * 0.00035
      const a = amp(e)
      out[0] = bx + a * (noise(bx * 0.008 + ph, by * 0.008, 3) - 0.5) * 2
      out[1] = by + a * (noise(bx * 0.008, by * 0.008 + ph, 5) - 0.5) * 2
      out[2] = noise(bx * 0.005 + ph, by * 0.005, 7) * TAU * 1.2
    }

    // ── portrait: the hero's own dots, in viewport coordinates ──
    const prep = async () => {
      await Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 650))])
      if (dead) return
      await yieldMain() // never in the same task as the font callbacks or HeroField's own start-up
      const hero = document.querySelector<HTMLElement>(".hero")
      const wrap = document.querySelector<HTMLElement>(".hero-field")
      measureStop()
      if (!hero || !wrap) return
      if (hero.getBoundingClientRect().bottom < 0.5 * window.innerHeight) return // scrolled away: reel + collapse only
      const { L, rect: pr, dots } = heroPortrait(hero, wrap)
      if (!pr || !dots) return
      await yieldMain() // the layout reads and the dot grid are one task, the particle set below another
      if (dead) return
      const o = wrap.getBoundingClientRect()
      rect = { x: o.left + pr.x, y: o.top + pr.y, w: pr.w, h: pr.h }
      dotPitch = L.pitch / 2
      const n = dots.x.length
      const r = mulberry32(2026)
      const nd = dx0.length
      const tmpA = [0, 0, 0]
      parts = new Array(n)
      tones = dots.tone
      plen = new Float32Array(n)
      pang = new Float32Array(n)
      for (let d = 0; d < n; d++) {
        const tx = o.left + dots.x[d]
        const ty = o.top + dots.y[d]
        const hh = r()
        const tone = dots.tone[d]
        if (mode === "full") {
          const delay = M.converge + (1 - tone) * 400 + hh * 150
          const src = Math.floor(r() * nd)
          dashAt(src, delay, tmpA)
          plen[d] = dLen[src]
          pang[d] = tmpA[2]
          const dist = Math.hypot(tx - tmpA[0], ty - tmpA[1])
          parts[d] = { sx: tmpA[0], sy: tmpA[1], tx, ty, bend: (r() - 0.5) * dist * 0.55, delay, dur: 400 + r() * 100 }
        } else {
          plen[d] = 2 + r() * 4
          pang[d] = r() * TAU
          parts[d] = { sx: tx, sy: ty, tx, ty, bend: 0, delay: (1 - tone) * 220 + hh * 70, dur: 0 }
        }
      }
      baked = new Uint8Array(n)
      lx = Math.floor((rect.x - 8) * dpr) / dpr // a whole device pixel, so the squares snap exactly as on the canvas
      ly = Math.floor((rect.y - 8) * dpr) / dpr
      layer.width = Math.ceil((rect.w + 24) * dpr)
      layer.height = Math.ceil((rect.h + 24) * dpr)
      lg = layer.getContext("2d")
      if (lg) {
        lg.setTransform(dpr, 0, 0, dpr, -lx * dpr, -ly * dpr)
        lg.globalCompositeOperation = "lighter"
        lg.fillStyle = UV
      }
      bake()
    }

    const yieldMain = () => new Promise<void>((r) => setTimeout(r, 0))

    const bake = () => {
      if (!img || !rect || cutout) return
      const m = matteCanvas()
      if (m) cutout = bakeCutout(img, rect, cdpr, m)
      if (cutout) {
        tmp.width = cutout.width
        tmp.height = cutout.height
        tc = tmp.getContext("2d")
      }
    }

    // where the full stop is (the flying square lands on it) and where the reel's "now" ends (it takes off from there)
    const measureStop = () => {
      const el = document.querySelector<HTMLElement>(".hero .full-stop")
      if (!el || !overlay) return
      const r = el.getBoundingClientRect()
      // the stamp animation scales it around its centre: take the centre from the rect and the size from the layout box
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const sw = el.offsetWidth || r.width
      const px = (n: number) => `${Math.round(n * 10) / 10}px`
      overlay.style.setProperty("--i-stop-x", px(cx - sw / 2))
      overlay.style.setProperty("--i-stop-y", px(cy - sw / 2))
      overlay.style.setProperty("--i-stop-s", px(sw))
      const num = overlay.querySelector<HTMLElement>(".intro-yr-now .intro-num")
      const from = num?.getBoundingClientRect()
      const nowSize = num ? parseFloat(getComputedStyle(num).fontSize) : 0
      const s0 = nowSize ? nowSize * 0.16 : sw
      // short variant (no reel): it takes off from the bottom-left corner
      const fx = from?.width ? from.right + 4 + s0 / 2 : 36
      const fy = from?.width ? from.bottom - nowSize * 0.14 - s0 / 2 : window.innerHeight - 36
      overlay.style.setProperty("--i-from-dx", px(fx - cx))
      overlay.style.setProperty("--i-from-dy", px(fy - cy))
      overlay.style.setProperty("--i-from-k", String(Math.round((s0 / sw) * 1000) / 1000))
    }

    // ── one frame, a pure function of e (and `fin`, the canvas's own fade-in) ──
    const pt = [0, 0, 0]
    const frame = (e: number, fin: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // the hand-off: dashes and marks clear first, the portrait crossfades into the page's own portrait underneath
      const c = clamp01((e - M.collapse) / M.collapseDur)
      const kd = (1 - sstep(0, 0.5, c)) * fin
      const kp = (1 - sstep(0.3, 0.9, c)) * fin

      // field dashes: bright at first, settling to their daylight alpha as the portrait forms
      if (kd > 0.002) {
        const boost = (1 + 2.4 * (1 - sstep(300, 1750, e))) * kd
        ctx.lineWidth = 1
        ctx.strokeStyle = PAPER
        for (let q = 0; q < Q; q++) {
          ctx.globalAlpha = Math.min(0.62, (A_MIN + (A_SPAN * (q + 0.5)) / Q) * boost)
          ctx.beginPath()
          for (let s = qStart[q]; s < qStart[q + 1]; s++) {
            const k = qOrder[s]
            dashAt(k, e, pt)
            const hx = (Math.cos(pt[2]) * dLen[k]) / 2
            const hy = (Math.sin(pt[2]) * dLen[k]) / 2
            const o = k * 4
            seg[o] = pt[0] - hx
            seg[o + 1] = pt[1] - hy
            seg[o + 2] = pt[0] + hx
            seg[o + 3] = pt[1] + hy
            ctx.moveTo(seg[o], seg[o + 1])
            ctx.lineTo(seg[o + 2], seg[o + 3])
          }
          ctx.stroke()
        }
        // year ink: a fixed half of the dashes takes the ink of the year that just rolled in, over their paper stroke.
        // Each year's strength eases in and out (tintAt), so consecutive years cross-dissolve instead of switching.
        if (mode === "full")
          for (let i = 0; i < inks.length; i++) {
            const env = tintAt(i, e)
            if (env < 0.01) continue
            ctx.strokeStyle = inks[i]
            ctx.globalAlpha = env * 0.85 * kd
            ctx.beginPath()
            for (let s = 0; s < subIdx.length; s++) {
              const o = subIdx[s] * 4
              ctx.moveTo(seg[o], seg[o + 1])
              ctx.lineTo(seg[o + 2], seg[o + 3])
            }
            ctx.stroke()
          }
        ctx.globalAlpha = 1
      }
      if (!rect || kp <= 0) return

      // converge: flying dashes (fading in as they leave, eased in and out), then UV squares
      const n = parts.length
      ctx.strokeStyle = PAPER
      ctx.lineWidth = 1
      if (mode === "full")
        for (let pass = 0; pass < 4; pass++) {
          // pass 0-2: dashes in their first LAUNCH ms (a third each, ramping up); pass 3: everyone else
          ctx.globalAlpha = 0.6 * kp * (pass === 3 ? 1 : (pass + 1) / 4)
          ctx.beginPath()
          for (let d = 0; d < n; d++) {
            const p = parts[d]
            const age = e - p.delay
            if (age < 0) continue
            const b = age >= LAUNCH ? 3 : Math.floor((age / LAUNCH) * 3)
            if (b !== pass) continue
            const s = particleAt(p, e)
            const fade = s.k < 1 ? 1 : 1 - smooth01((e - p.delay - p.dur) / MORPH)
            if (fade <= 0.02) continue
            const hx = ((Math.cos(pang[d]) * plen[d]) / 2) * fade
            const hy = ((Math.sin(pang[d]) * plen[d]) / 2) * fade
            // landing: the dash is already shrinking into its square
            ctx.moveTo(s.x - hx, s.y - hy)
            ctx.lineTo(s.x + hx, s.y + hy)
          }
          ctx.stroke()
        }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "lighter"
      ctx.fillStyle = UV
      for (let d = 0; d < n; d++) {
        const p = parts[d]
        const m = clamp01((e - p.delay - p.dur) / MORPH)
        if (m <= 0) continue
        if (m >= 1 && lg) {
          // landed: into the layer once, never filled again
          if (!baked[d]) {
            baked[d] = 1
            lg.globalAlpha = 1
            drawCell(lg, p.tx, p.ty, tones[d], 1, dpr, dotPitch)
          }
        } else drawCell(ctx, p.tx, p.ty, tones[d], easeAt(m) * kp, dpr, dotPitch)
      }
      if (lg) {
        ctx.globalAlpha = kp
        ctx.drawImage(layer, lx, ly, layer.width / dpr, layer.height / dpr)
      }
      ctx.globalCompositeOperation = "source-over"
      ctx.globalAlpha = 1

      // exposure: the glow, then the real photo developing from the face outward (smooth ramps, no pop)
      const f = clamp01((e - M.flash) / M.flashDur)
      const fx = rect.x + rect.w * FACE.u
      const fy = rect.y + rect.h * FACE.v
      if (f > 0 && f < 1) {
        const R = rect.h * 0.95
        const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, R)
        g.addColorStop(0, `rgba(${UV_RGB},${0.55 * Math.pow(Math.sin(Math.PI * f), 1.3) * kp})`)
        g.addColorStop(1, `rgba(${UV_RGB},0)`)
        ctx.globalCompositeOperation = "lighter"
        ctx.fillStyle = g
        ctx.fillRect(fx - R, fy - R, 2 * R, 2 * R)
        ctx.globalCompositeOperation = "source-over"
      }
      if (f > 0 && cutout) {
        if (f >= 1) {
          ctx.globalAlpha = kp
          ctx.drawImage(cutout, rect.x, rect.y, rect.w, rect.h)
        } else if (tc) {
          // opacity ramps over the whole flash while the mask opens from the face on a cubic ease-out
          const alpha = smooth01(f / 0.85) * kp
          const R = Math.hypot(rect.w, rect.h) * 1.1 * (1 - Math.pow(1 - f, 3))
          tc.setTransform(1, 0, 0, 1, 0, 0)
          tc.globalCompositeOperation = "source-over"
          tc.clearRect(0, 0, tmp.width, tmp.height)
          tc.drawImage(cutout, 0, 0)
          tc.globalCompositeOperation = "destination-in"
          const cx = tmp.width * FACE.u
          const cy = tmp.height * FACE.v
          const rr = Math.max(1, R * cdpr)
          const g = tc.createRadialGradient(cx, cy, 0, cx, cy, rr)
          g.addColorStop(0, "#000")
          g.addColorStop(0.55, "#000")
          g.addColorStop(1, "rgba(0,0,0,0)")
          tc.fillStyle = g
          tc.fillRect(0, 0, tmp.width, tmp.height)
          ctx.globalAlpha = alpha
          ctx.drawImage(tmp, rect.x, rect.y, rect.w, rect.h)
        }
        ctx.globalAlpha = 1
      }

      // registration marks snap around the rect, and its caption
      if (mode === "full") {
        const s = clamp01((e - (M.converge + 450)) / 300)
        if (s > 0) {
          const off = (1 - easeAt(s)) * 26 + 9
          ctx.strokeStyle = PAPER
          ctx.globalAlpha = 0.7 * smooth01(s) * kd
          ctx.lineWidth = 1
          ctx.beginPath()
          for (const [cx, cy, sx, sy] of [
            [rect.x, rect.y, -1, -1],
            [rect.x + rect.w, rect.y, 1, -1],
            [rect.x, rect.y + rect.h, -1, 1],
            [rect.x + rect.w, rect.y + rect.h, 1, 1],
          ] as const) {
            const x = cx + sx * off
            const y = cy + sy * off
            ctx.moveTo(x - 5, y)
            ctx.lineTo(x + 5, y)
            ctx.moveTo(x, y - 5)
            ctx.lineTo(x, y + 5)
          }
          ctx.stroke()
          ctx.fillStyle = PAPER
          ctx.globalAlpha = 0.6 * smooth01(s) * kd
          ctx.font = `450 11px ${mono}`
          ctx.textBaseline = "top"
          ctx.fillText("subject · malak mekyassi", rect.x, rect.y + rect.h + off + 8)
          ctx.globalAlpha = 1
        }
      }
    }

    const stop = () => {
      if (dead) return
      dead = true
      if (raf) cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.clearTimeout(stopTimer)
      window.removeEventListener("mm:intro-end", stop)
      window.removeEventListener("resize", onResize)
      canvas.width = canvas.height = 0 // releases the backing store
      tmp.width = tmp.height = 0
      layer.width = layer.height = 0
      lg = null
      cutout = null
      tc = null
      parts = []
    }
    const loop = () => {
      raf = 0
      if (dead) return
      if (!synced) {
        t0 = introClock(boot0) // pending on a very early hydration: resolves once the CSS animations have started
        synced = t0 !== boot0
      }
      const now = performance.now()
      const e = now - t0
      if (html.dataset.intro !== "full" && html.dataset.intro !== "short") return stop()
      if (firstAt < 0) firstAt = now
      frame(e, smooth01((now - firstAt) / CANVAS_IN))
      raf = requestAnimationFrame(loop)
    }
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        if (dead) return
        cutout = null
        size()
        prep()
      }, 120)
    }

    size()
    loop()
    window.addEventListener("mm:intro-end", stop)
    window.addEventListener("resize", onResize)
    prep()
    // re-measure the full stop just before the collapse starts (fonts, late layout)
    stopTimer = window.setTimeout(measureStop, Math.max(0, t0 + M.collapse - 80 - performance.now()))
    {
      const im = new Image()
      im.decoding = "async"
      const ready = () => {
        if (dead || img) return
        img = im
        bake()
      }
      im.onload = ready
      im.src = photos.portrait.img.src
      im.decode?.().then(ready, () => {})
    }

    return stop
  }, [])

  return null
}
