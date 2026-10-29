// Opening sequence ("Exposure", DESIGN §6.1): the timings every side shares, pure helpers for the year reel and the
// flying particles, and the inline boot script. Pure module: no DOM access at import time.

/**
 * Per-mode times are in ms after the GO signal (window.__mmIntro.tGo): the sequence's clock starts when everything it
 * needs is ready (fonts, portrait, layout), not at the boot script's t0. components/intro.tsx writes them as CSS custom
 * properties, so the CSS keyframe delays, the canvas stage and HeroField's hand-off read one source of truth.
 */
export const INTRO = {
  full: {
    /** One year on the reel (2022, 2024, 2025, 2026); the reel rolls 0..4*reel. */
    reel: 280,
    /** 2026 becomes "now" in UV. */
    now: 1750,
    /** The dashes start converging onto the portrait; the last one lands by `flash`. */
    converge: 700,
    /** Exposure: the real photo develops from the face outward. */
    flash: 1750,
    flashDur: 400,
    /** The hand-off: the ink and reel clear, the overlay portrait crossfades into the page's, a UV square flies to the full stop. */
    collapse: 2150,
    collapseDur: 600,
    timeout: 3100, // collapse + dur + slack for the CSS timeline starting after t0 (see introClock)
  },
  short: {
    reel: 0,
    now: 0,
    converge: 0,
    flash: 300,
    flashDur: 250,
    collapse: 450,
    collapseDur: 380,
    timeout: 1150,
  },
}

/**
 * The readiness budget, in ms after the boot script's t0 (inlined into BOOT). Until the go signal the overlay is plain
 * ink with nothing on it.
 *   go by `fullBy`  -> the full sequence;
 *   go by `abortAt` -> the short one (the page is slow, shorten the show rather than delay the page);
 *   not by `abortAt` -> abort: the ink fades out over `abortFade` and the page shows normally. If the web fonts are still
 *                       loading then (document.fonts.status), the fade waits for document.fonts.ready, at most until
 *                       `fontsBy`, so the page is never revealed in a fallback font that swaps a moment later.
 * ?intro=full|short forces its mode with no budget (QA); `safe` is then only the last-resort cap.
 * Measured on cold production loads (DESIGN §6.1): a warm desktop is ready in about 0.5-0.8 s, Fast 4G / 4x CPU in about 1 s.
 */
export const READY = { fullBy: 900, abortAt: 1600, fontsBy: 2800, abortFade: 300, safe: 8000 }

export type IntroMode = "full" | "short"

/** The CSS custom properties derived from INTRO (written inline on .intro and on :root by components/intro.tsx). */
export function introVars(): Record<string, string> {
  const f = INTRO.full
  const s = INTRO.short
  return {
    "--i-reel": `${f.reel}ms`,
    "--i-now": `${f.now}ms`,
    "--i-collapse": `${f.collapse}ms`,
    "--i-collapse-dur": `${f.collapseDur}ms`,
    "--i-s-collapse": `${s.collapse}ms`,
    "--i-s-collapse-dur": `${s.collapseDur}ms`,
  }
}

/**
 * The shared clock of the sequence, in performance.now() ms. The CSS animations start at the overlay's first style,
 * a few frames after the boot script's t0, so the canvas and HeroField's bloom run off the CSS start instead: the
 * overlay's own animation startTime (the document timeline shares performance.now()'s origin). Falls back to `t0`
 * while the CSS animations are still pending, or where getAnimations is missing (jsdom, very old browsers).
 */
export function introClock(t0: number): number {
  try {
    const anims = document.querySelector<HTMLElement>(".intro")?.getAnimations?.() ?? []
    for (const a of anims) if (typeof a.startTime === "number") return a.startTime
  } catch {
    // getAnimations unavailable or throwing: keep the boot clock
  }
  return t0
}

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

/** Ease-out (quartic) for flights: monotonic, easeAt(0) = 0, easeAt(1) = 1. */
export const easeAt = (t: number) => 1 - Math.pow(1 - clamp01(t), 4)

/** Smootherstep: zero speed and acceleration at both ends (a flight that leaves and lands softly). */
export const easeFlight = (t: number) => {
  const x = clamp01(t)
  return x * x * x * (x * (x * 6 - 15) + 10)
}

/** Smoothstep. */
export const smooth01 = (t: number) => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/** Year ink tint: eases in over TINT_IN ms, out over TINT_OUT ms, so consecutive years cross-dissolve. */
export const TINT_IN = 150
export const TINT_OUT = 380

/** Tint strength (0..1) of reel position `i` (0..3 years, 4 = "now") at `ms`. Always 0 in the short variant. */
export function tintAt(i: number, ms: number, mode: IntroMode = "full"): number {
  const m = INTRO[mode]
  if (!m.reel) return 0
  const at = i < 4 ? i * m.reel : m.now
  return smooth01((ms - at) / TINT_IN) * (1 - smooth01((ms - at - TINT_IN) / TINT_OUT))
}

export type Particle = {
  sx: number
  sy: number
  tx: number
  ty: number
  /** Perpendicular bend of the flight path, px (signed). */
  bend: number
  delay: number
  dur: number
}

/** Position and progress (0..1) of a particle at `ms`: a quadratic curve start -> target (eased in and out), exactly on target once landed. */
export function particleAt(p: Particle, ms: number): { x: number; y: number; k: number } {
  const k = p.dur > 0 ? clamp01((ms - p.delay) / p.dur) : ms >= p.delay ? 1 : 0
  if (k >= 1) return { x: p.tx, y: p.ty, k: 1 }
  const u = easeFlight(k)
  const dx = p.tx - p.sx
  const dy = p.ty - p.sy
  const len = Math.hypot(dx, dy) || 1
  const cx = p.sx + dx / 2 - (dy / len) * p.bend
  const cy = p.sy + dy / 2 + (dx / len) * p.bend
  const a = (1 - u) * (1 - u)
  const b = 2 * (1 - u) * u
  const c = u * u
  return { x: a * p.sx + b * cx + c * p.tx, y: a * p.sy + b * cy + c * p.ty, k }
}

/**
 * Inline boot script (rendered in <head> by app/layout.tsx). Runs before first paint:
 * 1. restores the UV lamp (localStorage "mm-lamp");
 * 2. on "/", decides the opening sequence: none (reduced motion, ?intro=off, deep link hash, back/forward, storage
 *    blocked), "full" (first view in this session) or "short" (later views); ?intro=full|short forces a mode;
 * 3. the overlay is plain ink until window.__mmIntro.go() (called by IntroStage once fonts, portrait and layout are ready):
 *    go() takes the mode from the READY budget (full by fullBy, else short), sets data-intro-go (every animation keys on
 *    it), records tGo, and re-arms the timeout from tGo. No go by abortAt: the ink fades out (data-intro="abort"), once
 *    the web fonts are in (fonts.ready, capped at fontsBy), and the page shows; a late go() does nothing. ?intro=full|short
 *    skips the budget (and the abort);
 * 4. any key / pointer / wheel / touch ends it at once (so does window.__mmIntro.end()); dispatches "mm:intro-go" and
 *    "mm:intro-end".
 */
export const BOOT = `(function(){var d=document.documentElement;try{if(localStorage.getItem("mm-lamp")==="on")d.dataset.lamp="on"}catch(e){}try{if(location.pathname!=="/")return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var q=/[?&]intro=(off|full|short)/.exec(location.search),p=window.performance,n=p&&p.getEntriesByType?p.getEntriesByType("navigation")[0]:null;if(q&&q[1]==="off")return;if(!q&&((location.hash&&location.hash!=="#top")||(n&&n.type==="back_forward")))return;var s=sessionStorage,m=q?q[1]:s.getItem("mm-intro")?"short":"full";s.setItem("mm-intro","1");d.dataset.intro=m;var t0=p.now(),B=window.__mmIntro={mode:m,t0:t0,tGo:0,aborted:0,end:end,go:go,plan:plan},ev=["keydown","pointerdown","wheel","touchstart"],done=0,went=0,held=0,tm;function plan(){if(done||went||held)return"";if(q)return m;return p.now()-t0>${READY.abortAt}?"":m==="full"&&p.now()-t0>${READY.fullBy}?"short":m}function clean(){clearTimeout(tm);ev.forEach(function(e){removeEventListener(e,end,true)})}function go(g){if(done||held)return"";if(went)return B.mode;var k=g==="full"||g==="short"?g:plan();if(!k||(!q&&p.now()-t0>${READY.abortAt}))return"";went=1;B.mode=k;B.tGo=p.now();d.dataset.intro=k;d.dataset.introGo="";clearTimeout(tm);tm=setTimeout(end,k==="full"?${INTRO.full.timeout}:${INTRO.short.timeout});dispatchEvent(new Event("mm:intro-go"));return k}function end(){if(done)return;done=1;d.dataset.intro="done";clean();dispatchEvent(new Event("mm:intro-end"))}function abort(){if(done||held)return;if(went)return end();var f=document.fonts,out=function(){if(!done)fade()};if(f&&f.status==="loading"){held=1;f.ready.then(out,out);setTimeout(out,Math.max(0,t0+${READY.fontsBy}-p.now()))}else fade()}function fade(){done=1;B.aborted=1;d.dataset.intro="abort";clean();dispatchEvent(new Event("mm:intro-end"));setTimeout(function(){d.dataset.intro="done"},${READY.abortFade}+30)}ev.forEach(function(e){addEventListener(e,end,{capture:true,passive:true})});tm=setTimeout(abort,q?${READY.safe}:${READY.abortAt})}catch(e){}})()`
