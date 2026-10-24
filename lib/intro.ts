// Opening sequence ("the torch pass", DESIGN §3): timings, the easing solver shared with the hero field, the
// deterministic fibre layout and the inline boot script. Pure module: no DOM access at import time.

export const INTRO = {
  full: { sweepAt: 500, sweep: 1400, timeout: 2600 },
  short: { sweepAt: 40, sweep: 520, timeout: 720 },
  /** Must equal --ease-sweep in globals.css. */
  ease: [0.45, 0, 0.2, 1] as const,
}

type Bezier = readonly [number, number, number, number]

/** For a cubic-bezier easing, the time fraction (0..1) at which the eased progress reaches p (0..1). */
export function timeAt(p: number, [x1, y1, x2, y2]: Bezier = INTRO.ease): number {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const X = (s: number) => ((ax * s + bx) * s + cx) * s
  const Y = (s: number) => ((ay * s + by) * s + cy) * s
  const q = Math.min(1, Math.max(0, p))
  if (q === 0) return 0
  if (q === 1) return 1
  let lo = 0
  let hi = 1
  for (let i = 0; i < 32; i++) {
    const m = (lo + hi) / 2
    if (Y(m) < q) lo = m
    else hi = m
  }
  return X((lo + hi) / 2)
}

/** ms after the boot script ran at which the sweep front reaches x = p × viewport width. */
export function frontAt(p: number, mode: "full" | "short"): number {
  const m = INTRO[mode]
  return m.sweepAt + m.sweep * timeAt(p)
}

export type FibreInk = "cyan" | "magenta" | "orange" | "yellow"
const INKS: FibreInk[] = ["cyan", "magenta", "orange", "yellow"]

function mulberry32(seed: number) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Fibre = { d: string; ink: FibreInk; x: number; delay: number }

/**
 * Security fibres: short curls in the four chapter inks, laid out in a 1000×1000 box that the SVG stretches to the
 * viewport. Each lights up as the sweep front passes its x.
 */
export function fibres(count = 36, seed = 365): Fibre[] {
  const r = mulberry32(seed)
  return Array.from({ length: count }, (_, i) => {
    const x = 30 + r() * 940
    const y = 60 + r() * 880
    const len = 14 + r() * 22
    const a = r() * Math.PI
    const dx = Math.cos(a) * len
    const dy = Math.sin(a) * len
    const bend = (r() - 0.5) * len * 1.4
    const f = (n: number) => n.toFixed(1)
    const d = `M${f(x - dx / 2)} ${f(y - dy / 2)}q${f(dx / 2 - dy * 0.3 + bend)} ${f(dy / 2 + dx * 0.3 - bend)} ${f(dx)} ${f(dy)}`
    return { d, ink: INKS[i % INKS.length], x, delay: Math.max(0, Math.round(frontAt(x / 1000, "full") - 30)) }
  })
}

/**
 * Inline boot script (rendered in <head> by app/layout.tsx). Runs before first paint:
 * 1. restores the UV lamp (localStorage "mm-lamp");
 * 2. on "/", decides the opening sequence: none (reduced motion, ?intro=off, deep link hash, back/forward, storage
 *    blocked), "full" (first view in this session) or "short" (later views); ?intro=full|short forces a mode;
 * 3. any key / pointer / wheel / touch ends it at once; a timeout cleans up; dispatches "mm:intro-end".
 */
export const BOOT = `(function(){var d=document.documentElement;try{if(localStorage.getItem("mm-lamp")==="on")d.dataset.lamp="on"}catch(e){}try{if(location.pathname!=="/")return;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var q=/[?&]intro=(off|full|short)/.exec(location.search),p=window.performance,n=p&&p.getEntriesByType?p.getEntriesByType("navigation")[0]:null;if(q&&q[1]==="off")return;if(!q&&((location.hash&&location.hash!=="#top")||(n&&n.type==="back_forward")))return;var s=sessionStorage,m=q?q[1]:s.getItem("mm-intro")?"short":"full";s.setItem("mm-intro","1");d.dataset.intro=m;window.__mmIntro={mode:m,t0:p.now()};var ev=["keydown","pointerdown","wheel","touchstart"],done=0;function end(){if(done)return;done=1;d.dataset.intro="done";ev.forEach(function(e){removeEventListener(e,end,true)});dispatchEvent(new Event("mm:intro-end"))}ev.forEach(function(e){addEventListener(e,end,{capture:true,passive:true})});setTimeout(end,m==="full"?${INTRO.full.timeout}:${INTRO.short.timeout})}catch(e){}})()`
