"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { ExternalLink } from "lucide-react"

const projects = [
  {
    title: "SXR — Model Security X-Ray",
    tags: ["Python", "UMAP", "HDBSCAN", "PyTorch"],
    description: "5-layer defensive ML security pipeline detecting adversarial threats in serialised model files (.pth, .safetensors, .h5) — covering LSB steganographic payload injection, Pickle RCE exploits, and backdoor attacks.",
    badge: "Research paper in preparation",
    link: "https://github.com/mal0101",
    image: "/abstract-neural-network-visualization-dark-theme.jpg",
  },
  {
    title: "HRL Trading System",
    tags: ["PPO", "SAC", "Stable-Baselines3", "Python"],
    description: "3-level Hierarchical Deep RL trading system over SPY, AAPL, and BTC-USD — PPO trend classifier (L1), PPO action agent (L2), SAC position-sizing agent (L3).",
    link: "https://github.com/mal0101",
    image: "/futuristic-data-dashboard-dark-minimal.jpg",
  },
  {
    title: "Aegis — AI Policy Decision-Support",
    tags: ["FastAPI", "ChromaDB", "React", "Vercel"],
    description: "AI-powered decision support platform for policymakers. RAG chatbot, case study library of 8 international AI policies, and Impact Simulator predicting social/economic/governance effects.",
    badge: "🏆 1st place — AgorAI Hackathon",
    link: "https://aegis-puce.vercel.app",
    image: "/abstract-memory-storage-visualization.jpg",
  },
  {
    title: "JarvisLfla7",
    tags: ["NLP", "Federated Learning", "VLM", "Voice"],
    description: "Voice-first AI assistant designed as a personal agronomist for Moroccan farmers. Built during HackAI across NLP, Federated Learning, and VLM challenges.",
    badge: "🥈 2nd place — HackAI",
    image: "/sound-wave-visualization-dark-theme.jpg",
  },
  {
    title: "Medicore",
    tags: ["Mistral OCR", "Voice Pipeline", "Python"],
    description: "AI clinical safety assistant built on Mistral OCR and a real-time voice pipeline for healthcare professionals.",
    badge: "🌍 Top 10 globally — Mistral AI Worldwide Hackathon",
    image: "/abstract-neural-network-visualization-dark-theme.jpg",
  },
  {
    title: "PlagAi",
    tags: ["Python", "NLTK", "scikit-learn"],
    description: "Plagiarism detection system using Jaccard similarity, TF-IDF cosine similarity, and n-gram analysis. Supports batch processing and configurable thresholds.",
    link: "https://github.com/mal0101/PlagAi",
    image: "/futuristic-data-dashboard-dark-minimal.jpg",
  },
]

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
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-24"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-gray-500 mb-4">PROJECTS</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic text-white">Selected Works</h2>
      </motion.div>

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
            <div
              data-cursor-hover
              className="group flex flex-col gap-3 cursor-pointer"
            >
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
              <p className="font-sans text-base text-gray-400 leading-relaxed max-w-2xl">
                {project.description}
              </p>

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
          className="fixed pointer-events-none z-50 w-64 h-40 md:w-80 md:h-48 overflow-hidden rounded-lg"
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
            <motion.img
              src={projects[hoveredIndex].image}
              alt={projects[hoveredIndex].title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                filter: "grayscale(30%) contrast(1.2)",
              }}
            />
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
