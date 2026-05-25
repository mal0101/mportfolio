"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export function About() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  return (
    <section id="about" ref={containerRef} className="relative py-32 overflow-hidden md:py-40 px-8 md:px-12 bg-black">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-gray-500 mb-4">ABOUT</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic text-white">Technical Foundation</h2>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="max-w-3xl space-y-6"
      >
        <p className="font-sans text-lg md:text-xl leading-relaxed text-white">
          AI & Software Engineering student at <span className="text-white font-medium">ENSAM Casablanca</span> specializing in ML security, reinforcement learning, and AI infrastructure. I build things end-to-end — RAG pipelines, defensive ML tooling, hierarchical RL systems.
        </p>
        <p className="font-sans text-lg md:text-xl leading-relaxed text-gray-400">
          3x hackathon winner, including a <span className="text-white font-medium">1st place recognised at an international AI conference</span> alongside Yann LeCun and Eric Xing.
        </p>
      </motion.div>

      {/* Decorative Line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-20 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent origin-left"
      />
    </section>
  )
}
