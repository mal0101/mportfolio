"use client"

import { education } from "@/data/portfolio"
import { SectionHeader } from "./section-header"
import { Reveal } from "./reveal"
import { DecorativeLine } from "./decorative-line"

export function Education() {
  return (
    <section className="relative py-32 overflow-hidden md:py-40 px-8 md:px-12 bg-black">
      <SectionHeader label="EDUCATION" title="Academic Background" />

      <div className="space-y-12">
        {education.map((edu, index) => (
          <Reveal key={`${edu.school}-${edu.period}`} delay={index * 0.1} className="border-l-2 border-gray-700 pl-8">
            <div className="mb-4">
              <h3 className="font-sans text-2xl md:text-3xl font-light text-white mb-2">{edu.degree}</h3>
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                <p className="font-mono text-sm tracking-wide text-gray-400">{edu.school}</p>
                <span className="font-mono text-sm text-gray-400">{edu.period}</span>
              </div>
            </div>

            {edu.details.length > 0 && (
              <ul className="space-y-2">
                {edu.details.map((detail, i) => (
                  <li key={i} className="font-sans text-base text-gray-400 leading-relaxed">
                    <span className="text-gray-500 mr-3">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        ))}
      </div>

      <DecorativeLine />
    </section>
  )
}
