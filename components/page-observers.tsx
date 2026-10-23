"use client"

import { useEffect } from "react"

export function PageObservers() {
  useEffect(() => {
    const cleanups: (() => void)[] = []

    // 1. reveals: only elements currently BELOW the viewport are put into the pending state
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            ;(e.target as HTMLElement).dataset.revealState = "in"
            io.unobserve(e.target)
          }
        },
        { rootMargin: "0px 0px -10% 0px" },
      )
      const vh = window.innerHeight
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.getBoundingClientRect().top > vh) {
          el.dataset.revealState = "pending"
          io.observe(el)
        }
      })
      cleanups.push(() => io.disconnect())
    }

    return () => cleanups.forEach((fn) => fn())
  }, [])
  return null
}
