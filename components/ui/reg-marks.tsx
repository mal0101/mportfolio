import type React from "react"
import { Microprint } from "@/components/ui/microprint"

function Plus({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4.5 0 V9 M0 4.5 H9" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}

// Marks sit on the grid-overlay lines: 0/50/100% below 1024px, 0/25/50/75/100% from 1024px.
const MARKS = [
  { left: "0%", lg: false },
  { left: "25%", lg: true },
  { left: "50%", lg: false },
  { left: "75%", lg: true },
  { left: "100%", lg: false },
]

export function RegRow() {
  return (
    <div className="reg-row" aria-hidden="true">
      <Microprint />
      {MARKS.map((m) => (
        <Plus key={m.left} className={m.lg ? "reg-mark reg-mark-lg" : "reg-mark"} style={{ left: m.left }} />
      ))}
    </div>
  )
}

export function Corner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  return <Plus className={`corner corner-${position}`} />
}
