"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import { setLenis } from "@/lib/lenis"

export function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    let lenis: Lenis | null = null
    const start = () => {
      if (lenis || mq.matches) return
      lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        autoRaf: true,
        anchors: { offset: -64 },
        prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
      })
      setLenis(lenis)
    }
    const stop = () => {
      lenis?.destroy()
      lenis = null
      setLenis(null)
    }
    const onChange = () => (mq.matches ? stop() : start())
    start()
    mq.addEventListener("change", onChange)
    return () => {
      mq.removeEventListener("change", onChange)
      stop()
    }
  }, [])
  return null
}
