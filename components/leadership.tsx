"use client"

import { motion } from "framer-motion"

const leadership = [
  {
    role: "President",
    organization: "Rotaract ENSAM Casablanca",
    period: "Sep 2023 – Jun 2025",
    description: "Led 30+ member team, organised social integration programmes for children with Down syndrome and autism",
  },
  {
    role: "VP & Sponsoring Manager",
    organization: "Student Council ADE",
    period: "Feb 2026 – Present",
    description: "Co-led council operations, secured corporate sponsors, raised funding for student events",
  },
  {
    role: "Participant",
    organization: "McKinsey Forward Program",
    period: "Sep – Dec 2025",
    description: "Executive education and strategic consulting training",
  },
]

export function Leadership() {
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
        <p className="font-mono text-xs tracking-[0.3em] text-gray-600 mb-4">LEADERSHIP</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic text-white">Community & Impact</h2>
      </motion.div>

      {/* Leadership List */}
      <div className="space-y-12">
        {leadership.map((item, index) => (
          <motion.div
            key={`${item.organization}-${item.period}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="border-l-2 border-gray-700 pl-8"
          >
            <div className="mb-4">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
                <h3 className="font-sans text-2xl md:text-3xl font-light text-white">
                  {item.role}
                </h3>
                <span className="font-mono text-sm text-gray-500">{item.period}</span>
              </div>
              <p className="font-mono text-sm tracking-wide text-gray-400">
                {item.organization}
              </p>
            </div>

            <p className="font-sans text-base md:text-lg text-gray-300 leading-relaxed">
              {item.description}
            </p>
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
