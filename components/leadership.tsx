"use client"

import { leadership } from "@/data/portfolio"
import { SectionHeader } from "./section-header"
import { Reveal } from "./reveal"
import { DecorativeLine } from "./decorative-line"

export function Leadership() {
  return (
    <section className="relative py-32 overflow-hidden md:py-40 px-8 md:px-12 bg-black">
      <SectionHeader label="LEADERSHIP" title="Community & Impact" />

      <div className="space-y-12">
        {leadership.map((item, index) => (
          <Reveal
            key={`${item.organization}-${item.period}`}
            delay={index * 0.1}
            className="border-l-2 border-gray-700 pl-8"
          >
            <div className="mb-4">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
                <h3 className="font-sans text-2xl md:text-3xl font-light text-white">{item.role}</h3>
                <span className="font-mono text-sm text-gray-400">{item.period}</span>
              </div>
              <p className="font-mono text-sm tracking-wide text-gray-400">{item.organization}</p>
            </div>

            <p className="font-sans text-base md:text-lg text-gray-300 leading-relaxed">{item.description}</p>
          </Reveal>
        ))}
      </div>

      <DecorativeLine />
    </section>
  )
}
