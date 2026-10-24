"use client"

import { useEffect } from "react"

let greeted = false

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

    // 3. photo lamp: one delegated listener; CSS draws the hole (fine pointers only, not under reduced motion)
    if (
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const onMove = (e: PointerEvent) => {
        const el = (e.target instanceof Element ? e.target.closest(".photo") : null) as HTMLElement | null
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty("--lx", `${Math.round(e.clientX - r.left)}px`)
        el.style.setProperty("--ly", `${Math.round(e.clientY - r.top)}px`)
      }
      document.addEventListener("pointermove", onMove, { passive: true })
      cleanups.push(() => document.removeEventListener("pointermove", onMove))
    }

    // 4. a note for whoever opens the inspector, once per page load
    if (!greeted) {
      greeted = true
      // CONFIRM(malak): console note
      console.info(
        "%cM.%c You opened the inspector. Read-only, like Axon.\nTry the UV lamp in the nav. mmekyassi@gmail.com",
        "font: 800 18px system-ui; color: #9469ff",
        "font: 12px ui-monospace, monospace",
      )
    }

    return () => cleanups.forEach((fn) => fn())
  }, [])
  return null
}
