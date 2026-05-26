"use client"

import { useState } from "react"
import { techItems, concepts } from "@/data/portfolio"

function MarqueeRow({ items, direction = "left" }: { items: string[]; direction?: "left" | "right" }) {
  const duplicatedItems = [...items, ...items, ...items, ...items]
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="relative overflow-hidden py-4">
      <div
        className={`flex gap-8 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}
        style={{ width: "fit-content" }}
      >
        {duplicatedItems.map((item, index) => (
          <span
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="font-sans text-5xl md:text-7xl lg:text-8xl font-light tracking-tight whitespace-nowrap cursor-default"
            style={{
              WebkitTextStroke: hoveredIndex === index ? "none" : "1px rgba(255,255,255,0.3)",
              color: hoveredIndex === index ? "white" : "transparent",
              transition: "all 0.3s ease",
            }}
          >
            {item}
            <span className="mx-8 text-white/20">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function TechMarquee() {
  return (
    <section aria-hidden="true" className="relative py-32 overflow-hidden md:py-40">
      <div className="space-y-4">
        <MarqueeRow items={techItems} direction="left" />
        <MarqueeRow items={concepts} direction="right" />
      </div>
    </section>
  )
}
