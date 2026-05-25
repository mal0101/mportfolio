"use client"

import { motion } from "framer-motion"

const hackathons = [
  {
    placement: "🥇 1st Place",
    name: "AgorAI",
    project: "Aegis — AI Policy Decision-Support Platform",
    detail: "Presented at international AI conference alongside Yann LeCun and Eric Xing",
    organizers: "EMINES / École Polytechnique / EMSI-Honoris",
  },
  {
    placement: "🥈 2nd Place",
    name: "HackAI",
    project: "JarvisLfla7 — Voice-first AI Agronomist",
    detail: "Voice-first AI assistant for Moroccan farmers",
    organizers: "",
  },
  {
    placement: "🌍 Top 10 Globally",
    name: "Mistral AI Worldwide Hackathon",
    project: "Medicore — AI Clinical Safety Assistant",
    detail: "AI clinical safety assistant with Mistral OCR and voice pipeline",
    organizers: "",
  },
]

export function Hackathons() {
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
        <p className="font-mono text-xs tracking-[0.3em] text-gray-500 mb-4">ACHIEVEMENTS</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic text-white">Hackathon Wins</h2>
      </motion.div>

      {/* Hackathon Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {hackathons.map((hackathon, index) => (
          <motion.div
            key={hackathon.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="border border-gray-700 rounded-lg p-6 md:p-8 hover:border-white/50 transition-colors duration-300 bg-gray-900"
          >
            <div className="mb-4">
              <p className="font-mono text-xs tracking-widest text-gray-400 mb-2">
                {hackathon.placement}
              </p>
              <h3 className="font-sans text-xl md:text-2xl font-light text-white mb-2">
                {hackathon.name}
              </h3>
            </div>

            <p className="font-sans text-base text-white/90 font-medium mb-2">
              {hackathon.project}
            </p>

            <p className="font-sans text-sm text-white/70 leading-relaxed mb-4">
              {hackathon.detail}
            </p>

            {hackathon.organizers && (
              <p className="font-mono text-xs text-muted-foreground">
                {hackathon.organizers}
              </p>
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
