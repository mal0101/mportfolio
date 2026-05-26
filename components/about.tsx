"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { SectionHeader } from "./section-header"
import { DecorativeLine } from "./decorative-line"

export function About() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1])

  return (
    <section id="about" ref={containerRef} className="relative py-32 overflow-hidden md:py-40 px-8 md:px-12 bg-black">
      <SectionHeader label="ABOUT" title="Technical Foundation" />

      <motion.div style={{ opacity }} className="max-w-3xl space-y-6">
        <p className="font-sans text-lg md:text-xl leading-relaxed text-white">
          AI & Software Engineering student at <span className="text-white font-medium">ENSAM Casablanca</span>{" "}
          specializing in ML security, reinforcement learning, and AI infrastructure. I build things end-to-end — RAG
          pipelines, defensive ML tooling, hierarchical RL systems.
        </p>
        <p className="font-sans text-lg md:text-xl leading-relaxed text-gray-400">
          2x hackathon winner, including a{" "}
          <span className="text-white font-medium">1st place recognised at an international AI conference</span>{" "}
          alongside Yann LeCun and Eric Xing.
        </p>
      </motion.div>

      <DecorativeLine />
    </section>
  )
}
