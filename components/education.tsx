"use client"

import { motion } from "framer-motion"

const education = [
  {
    degree: "Engineer's Degree in AI & Software Engineering",
    school: "ENSAM Casablanca",
    period: "Sep 2024 – Present",
    details: [
      "Coursework: Machine Learning, Deep Learning, Reinforcement Learning, NLP, Software Architecture, Algorithms",
      "Research paper in preparation: \"Defensive ML Security: Adversarial Threat Detection and Backdoor Neutralisation in Serialised Model Files\"",
    ],
  },
  {
    degree: "Integrated Preparatory Classes",
    school: "ENSAM Casablanca",
    period: "Oct 2022 – Jun 2024",
    details: [],
  },
]

export function Education() {
  return (
    <section className="relative py-32 overflow-hidden md:py-40 px-8 md:px-12 bg-black">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-gray-500 mb-4">EDUCATION</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic text-white">Academic Background</h2>
      </motion.div>

      {/* Education List */}
      <div className="space-y-12">
        {education.map((edu, index) => (
          <motion.div
            key={`${edu.school}-${edu.period}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="border-l-2 border-gray-700 pl-8"
          >
            <div className="mb-4">
              <h3 className="font-sans text-2xl md:text-3xl font-light text-white mb-2">
                {edu.degree}
              </h3>
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                <p className="font-mono text-sm tracking-wide text-gray-400">
                  {edu.school}
                </p>
                <span className="font-mono text-sm text-gray-500">{edu.period}</span>
              </div>
            </div>

            {edu.details.length > 0 && (
              <ul className="space-y-2">
                {edu.details.map((detail, i) => (
                  <li key={i} className="font-sans text-base text-gray-400 leading-relaxed">
                    <span className="text-gray-600 mr-3">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>

      {/* Decorative Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-20 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent origin-left"
      />
    </section>
  )
}
