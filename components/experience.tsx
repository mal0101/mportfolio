"use client"

import { experiences } from "@/data/portfolio"
import { SectionHeader } from "./section-header"
import { Reveal } from "./reveal"
import { DecorativeLine } from "./decorative-line"

export function Experience() {
  return (
    <section className="relative py-32 overflow-hidden md:py-40 px-8 md:px-12 bg-black">
      <SectionHeader label="EXPERIENCE" title="Professional Journey" />

      <div className="space-y-16">
        {experiences.map((exp, index) => (
          <Reveal
            key={`${exp.company}-${exp.period}`}
            delay={index * 0.1}
            className="border-l-2 border-gray-700 pl-8 pb-8"
          >
            <div className="mb-4">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
                <h3 className="font-sans text-2xl md:text-3xl font-light text-white">{exp.role}</h3>
                <span className="font-mono text-sm text-gray-500">{exp.period}</span>
              </div>
              <p className="font-mono text-sm tracking-wide text-gray-400">
                {exp.company} • {exp.location}
              </p>
            </div>

            <ul className="space-y-3">
              {exp.highlights.map((highlight, i) => (
                <li key={i} className="font-sans text-base md:text-lg text-gray-300 leading-relaxed">
                  <span className="text-gray-600 mr-3">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <DecorativeLine />
    </section>
  )
}
