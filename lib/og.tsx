import { ImageResponse } from "next/og"
import { personalInfo, venture } from "@/data/portfolio"

// Shared renderer for app/opengraph-image.tsx and app/twitter-image.tsx (DESIGN §8): ink ground, faint column lines,
// a dash field on the right with the M. mark revealed in UV, the name, the role line, Axon's tagline and a microprint
// strip. All text comes from data/portfolio.ts.
const ROLE = `${venture.role}, ${venture.name}` // CONFIRM(malak): OG image text
const TAG = venture.tagline
const INK = "#0b0a0f"
const PAPER = "#efedf5"
const UV = "#9469ff"
// The M path (components/ui/mark.tsx) as straight segments, in viewBox units (120x100)
const SEGS: [number, number, number, number][] = [
  [12, 86, 12, 16],
  [12, 16, 46, 58],
  [46, 58, 80, 16],
  [80, 16, 80, 86],
]

/**
 * Fetches a static, text-subset instance of a Google font (TTF/OTF; Satori does not read woff2 or variable fonts).
 * Returns null on any failure so an offline build still renders with the bundled default font.
 */
async function googleFont(query: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`https://fonts.googleapis.com/css2?family=${query}&text=${encodeURIComponent(text)}`)
    if (!res.ok) return null
    const css = await res.text()
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
    if (!src) return null
    const font = await fetch(src)
    return font.ok ? await font.arrayBuffer() : null
  } catch {
    return null
  }
}

function distToSeg(px: number, py: number, [x1, y1, x2, y2]: [number, number, number, number]) {
  const dx = x2 - x1
  const dy = y2 - y1
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

/** The hero's dash field as an SVG data URI, with the payload cells lit as UV squares. */
function fieldSvg(w: number, h: number) {
  const pitch = 14
  const markH = 290
  const s = markH / 100
  const ox = w - 72 - 108 * s // square's right edge on the 72px content edge
  const oy = 56
  let out = ""
  for (let y = pitch / 2; y < h; y += pitch) {
    for (let x = pitch / 2; x < w; x += pitch) {
      const mx = (x - ox) / s
      const my = (y - oy) / s
      const inMark = SEGS.some((g) => distToSeg(mx, my, g) <= 6) || (mx >= 94 && mx <= 108 && my >= 72 && my <= 86)
      if (inMark) {
        out += `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="${UV}" fill-opacity=".18"/>`
        out += `<rect x="${x - 2}" y="${y - 2}" width="4" height="4" fill="${UV}"/>`
      } else {
        const a = (Math.sin(x * 0.031) + Math.cos(y * 0.027) + 2) * 0.785
        const l = 3 + ((x * 7 + y * 13) % 5)
        const dx = (Math.cos(a) * l) / 2
        const dy = (Math.sin(a) * l) / 2
        out += `<line x1="${(x - dx).toFixed(1)}" y1="${(y - dy).toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}" stroke="${PAPER}" stroke-opacity=".18"/>`
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${out}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export async function renderOg(size: { width: number; height: number }) {
  const { firstName, lastName } = personalInfo
  const [display, serif, body] = await Promise.all([
    googleFont("Hubot+Sans:wdth,wght@112,800", `${firstName}${lastName}`),
    googleFont("Newsreader:ital,wght@1,400", ROLE),
    googleFont("Hubot+Sans:wght@400", `${TAG}malakmekyassi`),
  ])
  const fonts = [
    ...(display ? [{ name: "Hubot Display", data: display, weight: 800 as const, style: "normal" as const }] : []),
    ...(serif ? [{ name: "Newsreader", data: serif, weight: 400 as const, style: "italic" as const }] : []),
    ...(body ? [{ name: "Hubot", data: body, weight: 400 as const, style: "normal" as const }] : []),
  ]
  const fieldW = 600

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: INK,
        color: PAPER,
        fontFamily: "Hubot",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fieldSvg(fieldW, size.height)}
        width={fieldW}
        height={size.height}
        style={{ position: "absolute", right: 0, top: 0 }}
        alt=""
      />
      {/* fade the field into the ink on its left edge */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: fieldW - 240,
          width: 240,
          background: `linear-gradient(90deg, ${INK}, rgba(11,10,15,0))`,
        }}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 72 + i * 264,
            width: 1,
            background: "rgba(239,237,245,0.07)",
          }}
        />
      ))}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 72px 64px",
          width: "100%",
        }}
      >
        <div style={{ fontFamily: "Newsreader", fontStyle: "italic", fontSize: 34 }}>{ROLE}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Hubot Display",
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 0.84,
            letterSpacing: "-0.045em",
            marginTop: 24,
          }}
        >
          <div>{firstName}</div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            {lastName}
            <div style={{ width: 24, height: 24, background: UV, marginLeft: 8, marginBottom: 18 }} />
          </div>
        </div>
        <div style={{ fontSize: 26, color: "rgba(239,237,245,0.64)", marginTop: 32 }}>{TAG}</div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            height: 8,
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontSize: 7,
            letterSpacing: "0.06em",
            color: "rgba(239,237,245,0.3)",
          }}
        >
          {"malakmekyassi".repeat(60)}
        </div>
      </div>
    </div>,
    { ...size, fonts },
  )
}
