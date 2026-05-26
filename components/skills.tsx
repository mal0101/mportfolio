"use client"

import { motion } from "framer-motion"
import { skillCategories } from "@/data/portfolio"
import { SectionHeader } from "./section-header"
import { Reveal } from "./reveal"
import { DecorativeLine } from "./decorative-line"

export function Skills() {
  return (
    <section id="skills" className="relative py-32 overflow-hidden md:py-40 px-8 md:px-12 bg-black">
      <SectionHeader label="TECHNICAL ARSENAL" title="Skills & Expertise" />

      <div className="grid md:grid-cols-2 gap-12">
        {skillCategories.map((category, index) => (
          <Reveal key={category.category} delay={index * 0.1}>
            <h3 className="font-sans text-xl md:text-2xl font-light text-white mb-6">{category.category}</h3>
            <div className="flex flex-wrap gap-3">
              {category.skills.map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{ scale: 1.05 }}
                  className="font-mono text-sm tracking-wider px-3.5 py-2 border border-gray-600 rounded-full text-gray-400 hover:border-white hover:text-white transition-colors duration-300"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>

      <DecorativeLine />
    </section>
  )
}
