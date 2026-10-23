"use client"

import { useEffect, useState } from "react"

/** The build-time year is rendered on the server; the client corrects it, so a static page never shows a stale year. */
export function CopyrightYear({ initial }: { initial: number }) {
  const [year, setYear] = useState(initial)
  useEffect(() => setYear(new Date().getFullYear()), [])
  return <>{year}</>
}
