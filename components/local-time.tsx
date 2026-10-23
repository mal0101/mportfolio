"use client"

import { useEffect, useState } from "react"
import { personalInfo } from "@/data/portfolio"

const fmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: personalInfo.timeZone,
})

export function LocalTime({ className }: { className?: string }) {
  const [t, setT] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => setT(fmt.format(new Date()))
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])
  return <time className={`t-data inline-block w-[5ch] text-paper ${className ?? ""}`}>{t ?? "--:--"}</time>
}
