"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

export function Footer() {
  const [time, setTime] = useState("")
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const seconds = now.getSeconds().toString().padStart(2, "0")
      const milliseconds = now.getMilliseconds().toString().padStart(3, "0")
      setTime(`${hours}:${minutes}:${seconds}.${milliseconds}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 10)
    return () => clearInterval(interval)
  }, [])

  return (
    <footer id="contact" className="relative bg-black">
      {/* Main CTA */}
      <motion.a
        href="mailto:mmekyassi@gmail.com"
        data-cursor-hover
        className="relative block overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Curtain */}
        <motion.div
          className="absolute inset-0 bg-white/10"
          initial={{ y: "100%" }}
          animate={{ y: isHovered ? "0%" : "100%" }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* Content */}
        <div className="relative py-20 md:py-28 px-8 md:px-12 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.h2
              className="font-sans text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-center md:text-left"
              animate={{
                color: isHovered ? "#000000" : "#fafafa",
              }}
              transition={{ duration: 0.3 }}
            >
              Get in <span className="italic">Touch</span>
            </motion.h2>

            <motion.div
              animate={{
                rotate: isHovered ? 45 : 0,
                color: isHovered ? "#000000" : "#fafafa",
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight className="w-12 h-12 md:w-16 md:h-16" />
            </motion.div>
          </div>
        </div>
      </motion.a>

      {/* Footer Info */}
      <div className="px-8 md:px-12 py-12 border-t border-gray-700">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact */}
          <div>
            <p className="font-mono text-xs tracking-widest text-gray-500 mb-3">EMAIL</p>
            <a href="mailto:mmekyassi@gmail.com" className="font-mono text-sm text-gray-300 hover:text-white transition-colors">
              mmekyassi@gmail.com
            </a>
          </div>

          {/* Social Links */}
          <div>
            <p className="font-mono text-xs tracking-widest text-gray-500 mb-3">SOCIALS</p>
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/mal0101"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hover
                className="font-mono text-sm text-gray-500 hover:text-white transition-colors duration-300"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/malak-mekyassi"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hover
                className="font-mono text-sm text-gray-500 hover:text-white transition-colors duration-300"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Location & Time */}
          <div>
            <p className="font-mono text-xs tracking-widest text-gray-500 mb-3">LOCATION</p>
            <p className="font-mono text-sm text-gray-400">
              Casablanca, Morocco
            </p>
            <p className="font-mono text-xs text-gray-500 mt-3">Local time: {time}</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <p className="font-mono text-xs tracking-widest text-gray-600 text-center">
            © {new Date().getFullYear()} Malak Mekyassi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
