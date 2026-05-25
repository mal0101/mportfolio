"use client"

import { motion } from "framer-motion"

const skillCategories = [
  {
    category: "ML & AI",
    skills: ["PyTorch", "TensorFlow", "Stable-Baselines3", "Gymnasium", "FAISS", "Sentence Transformers", "ChromaDB", "XGBoost", "NLP", "RL", "Deep Learning"],
  },
  {
    category: "Backend & Infra",
    skills: ["Python", "SQL", "C", "Java", "Flask", "Django", "FastAPI", "Docker", "JWT", "OAuth2"],
  },
  {
    category: "Research",
    skills: ["UMAP", "HDBSCAN", "Adversarial ML", "RAG pipelines", "RLHF"],
  },
  {
    category: "Languages",
    skills: ["English (fluent)", "French (fluent)", "Arabic (native)"],
  },
]

export function Skills() {
  return (
    <section id="skills" className="relative py-32 overflow-hidden md:py-40 px-8 md:px-12 bg-black">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-gray-500 mb-4">TECHNICAL ARSENAL</p>
        <h2 className="font-sans text-4xl md:text-5xl font-light italic text-white">Skills & Expertise</h2>
      </motion.div>

      {/* Skills Grid */}
      <div className="grid md:grid-cols-2 gap-12">
        {skillCategories.map((category, index) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          >
            <h3 className="font-sans text-xl md:text-2xl font-light text-white mb-6">
              {category.category}
            </h3>
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
