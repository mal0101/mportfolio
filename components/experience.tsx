"use client"

import { motion } from "framer-motion"

const experiences = [
  {
    role: "Software Engineering Intern",
    company: "NowEdge",
    period: "Jun – Sep 2025",
    location: "Casablanca",
    highlights: [
      "Built a production multi-tenant RAG chatbot using FAISS vector search, sentence-transformer embeddings, and JWT-based client isolation",
      "Engineered a typosquatting detection model via multi-heuristic domain classification, achieving 80% precision",
      "Architected an LTI 1.3-compliant platform with OAuth2/OpenID Connect",
    ],
  },
  {
    role: "AI Trainer",
    company: "Outlier AI, Alignerr, Prolific",
    period: "Nov 2024 – Present",
    location: "Remote",
    highlights: [
      "Authored 500+ prompt-response pairs and adversarial test cases for RLHF fine-tuning pipelines across Python, SQL, C, and Java",
    ],
  },
]

export function Experience() {
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
        <p className="font-mono text-xs tracking-[0.3em] text-gray-500 mb-4">EXPERIENCE</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic text-white">Professional Journey</h2>
      </motion.div>

      {/* Experiences List */}
      <div className="space-y-16">
        {experiences.map((exp, index) => (
          <motion.div
            key={`${exp.company}-${exp.period}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="border-l-2 border-gray-700 pl-8 pb-8"
          >
            {/* Header */}
            <div className="mb-4">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
                <h3 className="font-sans text-2xl md:text-3xl font-light text-white">
                  {exp.role}
                </h3>
                <span className="font-mono text-sm text-gray-500">{exp.period}</span>
              </div>
              <p className="font-mono text-sm tracking-wide text-gray-400">
                {exp.company} • {exp.location}
              </p>
            </div>

            {/* Highlights */}
            <ul className="space-y-3">
              {exp.highlights.map((highlight, i) => (
                <li key={i} className="font-sans text-base md:text-lg text-gray-300 leading-relaxed">
                  <span className="text-gray-600 mr-3">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

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
