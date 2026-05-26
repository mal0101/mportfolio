"use client"

import { hackathons } from "@/data/portfolio"
import { SectionHeader } from "./section-header"
import { Reveal } from "./reveal"
import { DecorativeLine } from "./decorative-line"

export function Hackathons() {
  return (
    <section className="relative py-32 overflow-hidden md:py-40 px-8 md:px-12 bg-black">
      <SectionHeader label="ACHIEVEMENTS" title="Hackathon Wins" />

      <div className="grid md:grid-cols-3 gap-8">
        {hackathons.map((hackathon, index) => (
          <Reveal
            key={hackathon.name}
            delay={index * 0.1}
            className="border border-gray-700 rounded-lg p-6 md:p-8 hover:border-white/50 transition-colors duration-300 bg-gray-900"
          >
            <div className="mb-4">
              <p className="font-mono text-xs tracking-widest text-gray-400 mb-2">{hackathon.placement}</p>
              <h3 className="font-sans text-xl md:text-2xl font-light text-white mb-2">{hackathon.name}</h3>
            </div>

            <p className="font-sans text-base text-white/90 font-medium mb-2">{hackathon.project}</p>

            <p className="font-sans text-sm text-white/70 leading-relaxed mb-4">{hackathon.detail}</p>

            {hackathon.organizers && <p className="font-mono text-xs text-muted-foreground">{hackathon.organizers}</p>}
          </Reveal>
        ))}
      </div>

      <DecorativeLine />
    </section>
  )
}
