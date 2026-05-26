"use client"

import { motion } from "framer-motion"

interface SectionHeaderProps {
  label: string
  title: string
}

export function SectionHeader({ label, title }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mb-20"
    >
      <p className="font-mono text-xs tracking-[0.3em] text-gray-500 mb-4">{label}</p>
      <h2 className="font-sans text-4xl md:text-5xl font-light italic text-white">{title}</h2>
    </motion.div>
  )
}
