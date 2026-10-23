"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "@/components/ui/icons"

export function CopyEmail({ email }: { email: string }) {
  const [supported, setSupported] = useState(false)
  const [copied, setCopied] = useState(false)
  const [announce, setAnnounce] = useState("")
  const timer = useRef(0)

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function")
    return () => window.clearTimeout(timer.current)
  }, [])

  if (!supported) return null

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setAnnounce("Email address copied")
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        setCopied(false)
        setAnnounce("")
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <button type="button" onClick={onClick} className="tlink copy-btn">
        {copied ? <Check size={14} /> : <Copy size={14} />}
        <span className="tlink-text">{copied ? "Copied" : "Copy email"}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>
    </>
  )
}
