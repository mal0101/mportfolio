import { describe, expect, it } from "vitest"
import { existsSync, readdirSync, readFileSync, statSync } from "fs"
import path from "path"

// Guards against the old site creeping back in (DESIGN §9).
const root = path.resolve(__dirname, "..")
const at = (...p: string[]) => path.join(root, ...p)
const REMOVED = ["three", "@react-three/fiber", "@types/three", "framer-motion", "lucide-react", "tw-animate-css"]

function files(dir: string): string[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name)
    return statSync(p).isDirectory() ? files(p) : [p]
  })
}

describe("guards", () => {
  it("has no route-level loading UI", () => {
    expect(existsSync(at("app", "loading.tsx"))).toBe(false)
  })

  it("does not depend on the removed libraries", () => {
    const pkg = JSON.parse(readFileSync(at("package.json"), "utf8"))
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
    for (const name of REMOVED) expect(deps).not.toContain(name)
  })

  it("keeps old copy, dynamic imports and loading markup out of the source", () => {
    const forbidden = [
      "AVAILABLE FOR WORK",
      "ENGINEER & RESEARCHER",
      "next/dynamic",
      ">LOADING<",
      "ENSAM",
      "Currently contributing",
      // wins and major projects only; talks, workshops and events stay on LinkedIn (Malak, 2026-10-23)
      "Oracle",
      "VibeCoding",
      "Manus",
      "masterclass",
    ]
    const sources = ["app", "components", "data", "lib"].flatMap((d) => files(at(d)))
    expect(sources.length).toBeGreaterThan(0)
    for (const file of sources) {
      const text = readFileSync(file, "utf8")
      for (const s of forbidden) expect(text.includes(s), `${path.relative(root, file)} contains "${s}"`).toBe(false)
    }
  })

  it("ships none of the stock project images", () => {
    const stock = [
      "abstract-memory-storage-visualization.jpg",
      "abstract-neural-network-visualization-dark-theme.jpg",
      "futuristic-data-dashboard-dark-minimal.jpg",
      "sound-wave-visualization-dark-theme.jpg",
    ]
    const shipped = files(at("public")).map((f) => path.basename(f))
    for (const name of stock) expect(shipped).not.toContain(name)
  })

  it("ships photos without EXIF from assets/photos only", () => {
    const jpgs = files(at("assets", "photos")).filter((f) => f.endsWith(".jpg"))
    expect(jpgs).toHaveLength(3)
    for (const f of jpgs) {
      const buf = readFileSync(f)
      expect(buf.includes(Buffer.from("Exif\0\0")), path.basename(f)).toBe(false)
    }
    expect(
      files(at("public")).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f) && !f.includes("partners/")),
    ).toHaveLength(0)
  })

  it("defines every motion token it uses on :root (a var() out of scope silently drops the whole animation)", () => {
    const css = readFileSync(at("app", "globals.css"), "utf8")
    const rootBlock = /:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? ""
    const used = new Set([...css.matchAll(/var\((--(?:ease|dur)-[\w-]+)\)/g)].map((m) => m[1]))
    expect(used.size).toBeGreaterThan(0)
    for (const name of used) expect(rootBlock, name).toContain(`${name}:`)
  })

  it("keys every intro animation on the go signal, and never shows the flying stop unmeasured", () => {
    const css = readFileSync(at("app", "globals.css"), "utf8")
    const from = css.indexOf("/* sequence states")
    const to = css.indexOf("@media (prefers-reduced-motion: reduce)", from)
    const block = css.slice(from, to)
    const rules = [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].trim(), body: m[2] }))
    const animated = rules.filter(
      (r) => /animation(-delay)?\s*:/.test(r.body) && /html\[data-intro="(full|short)"\]/.test(r.sel),
    )
    expect(animated.length).toBeGreaterThan(8)
    for (const r of animated) {
      // the abort fade is the one animation without go: it runs when go never came
      if (r.sel.includes('data-intro="abort"')) continue
      expect(r.sel, r.sel).toContain("[data-intro-go]")
    }
    // the stop never flies (or shows) before IntroStage has measured where it lands
    for (const r of rules.filter(
      (r) => r.sel.includes(".intro-stop") && /animation\s*:|visibility\s*:\s*visible/.test(r.body),
    ))
      expect(r.sel, r.sel).toContain("[data-measured]")
    // and the stop has no fallback position
    expect(css).not.toMatch(/left:\s*var\(--i-stop-x,\s*50%\)/)
    // nothing on the overlay shows before go
    expect(block).toMatch(/\.intro-top,\s*\.intro-reel,\s*\.intro-stop\s*\{\s*visibility:\s*hidden/)
  })
})
