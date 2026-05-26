"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { projects } from "@/data/portfolio"
import { SectionHeader } from "./section-header"

export function Works() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set(e.clientX - rect.left)
      mouseY.set(e.clientY - rect.top)
    }
  }

  return (
    <section id="works" className="relative py-32 px-8 md:px-12 md:py-40 bg-black">
      <SectionHeader label="PROJECTS" title="Selected Works" />

      {/* Projects List */}
      <div ref={containerRef} onMouseMove={handleMouseMove} className="relative space-y-1">
        {projects.map((project, index) => (
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.05 }}
            className="relative border-t border-gray-800 py-6 md:py-8"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div data-cursor-hover className="group flex flex-col gap-3 cursor-pointer">
              {/* Title */}
              <motion.h3
                className="font-sans text-2xl md:text-3xl font-light tracking-tight text-white group-hover:text-gray-300 transition-colors duration-300"
                animate={{
                  x: hoveredIndex === index ? 10 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {project.title}
              </motion.h3>

              {/* Description */}
              <p className="font-sans text-base text-gray-400 leading-relaxed max-w-2xl">{project.description}</p>

              {/* Tags and Badge */}
              <div className="flex flex-wrap gap-2 items-center pt-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs tracking-wider px-2.5 py-1 border border-gray-700 rounded-full text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
                {project.badge && (
                  <span className="font-mono text-xs tracking-wider px-2.5 py-1 border border-gray-600 rounded-full text-gray-300 ml-2">
                    {project.badge}
                  </span>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-gray-600 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Floating Image */}
        <motion.div
          className="hidden md:block fixed pointer-events-none z-50 w-64 h-40 md:w-80 md:h-48 overflow-hidden rounded-lg"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            opacity: hoveredIndex !== null ? 1 : 0,
            scale: hoveredIndex !== null ? 1 : 0.8,
          }}
          transition={{ duration: 0.2 }}
        >
          {hoveredIndex !== null && (
            <motion.div
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative w-full h-full"
            >
              <Image
                src={projects[hoveredIndex].image}
                alt={projects[hoveredIndex].title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 256px, 320px"
                style={{
                  filter: "grayscale(30%) contrast(1.2)",
                }}
              />
            </motion.div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>
      </div>

      {/* Bottom Border */}
      <div className="border-t border-gray-800 mt-8" />
    </section>
  )
}
