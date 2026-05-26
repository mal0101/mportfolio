"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform } from "framer-motion"
import { personalInfo } from "@/data/portfolio"

const SentientSphere = dynamic(() => import("./sentient-sphere").then((m) => m.SentientSphere), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-64 h-64 rounded-full border border-white/10 animate-pulse" />
    </div>
  ),
})

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
      {/* 3D Sphere Background */}
      <div className="absolute inset-0">
        <SentientSphere />
      </div>

      {/* Typography Overlay */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12 md:px-12 md:py-20"
      >
        {/* Top Left - Name with Profile Picture */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex gap-8 items-start"
        >
          {/* Profile Image */}
          <div className="hidden md:flex flex-shrink-0">
            <div className="w-40 h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
              <span className="font-sans text-5xl font-light text-gray-600">MM</span>
            </div>
          </div>

          {/* Name Section */}
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-gray-500 mb-4">{personalInfo.tagline}</p>
            <h1 className="font-sans text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white">
              {personalInfo.name.split(" ")[0].toUpperCase()}
              <br />
              <span className="italic">{personalInfo.name.split(" ")[1].toUpperCase()}</span>
            </h1>
          </div>
        </motion.div>

        {/* Center Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-2xl px-8"
        >
          <p className="font-sans text-xl md:text-2xl text-center text-white/80 leading-relaxed">
            {personalInfo.description}
          </p>
        </motion.div>

        {/* Bottom Right - Location & Links */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="self-end text-right"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-3">
            {personalInfo.location.toUpperCase()}
          </p>
          <div className="flex flex-col gap-2 items-end">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm tracking-wider text-white/70 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm tracking-wider text-white/70 hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${personalInfo.email}`}
              className="font-mono text-sm tracking-wider text-white/70 hover:text-white transition-colors"
            >
              {personalInfo.email}
            </a>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
