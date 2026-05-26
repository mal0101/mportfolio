"use client"

import { motion } from "framer-motion"

export function DecorativeLine() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mt-20 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent origin-left"
    />
  )
}
