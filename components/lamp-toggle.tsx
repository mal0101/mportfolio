"use client"

import { useEffect, useState } from "react"

const KEY = "mm-lamp"

/** Switches the UV lamp: html[data-lamp="on"], remembered per browser, announced to the hero canvas and other toggles. */
export function setLamp(on: boolean) {
  const d = document.documentElement
  if (on) d.dataset.lamp = "on"
  else delete d.dataset.lamp
  try {
    localStorage.setItem(KEY, on ? "on" : "off")
  } catch {
    // storage blocked: the lamp still works for this page view
  }
  window.dispatchEvent(new CustomEvent<boolean>("mm:lamp", { detail: on }))
}

export function useLamp(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false)
  useEffect(() => {
    setOn(document.documentElement.dataset.lamp === "on") // the boot script may have restored it before hydration
    const sync = (e: Event) => setOn((e as CustomEvent<boolean>).detail)
    window.addEventListener("mm:lamp", sync)
    return () => window.removeEventListener("mm:lamp", sync)
  }, [])
  return [on, setLamp]
}

/** Nav / menu toggle: constant name "uv lamp", state in aria-pressed. */
export function LampToggle({ className }: { className?: string }) {
  const [on, set] = useLamp()
  return (
    <button
      type="button"
      className={className ? `lamp-btn ${className}` : "lamp-btn"}
      aria-pressed={on}
      onClick={() => set(!on)}
    >
      <span className="lamp-sq" aria-hidden="true" />
      {/* CONFIRM(malak): control label */}
      uv lamp
    </button>
  )
}

/** Footer text button: the label states the action (no aria-pressed, the text changes instead). */
export function LampTextButton() {
  const [on, set] = useLamp()
  return (
    <button type="button" className="tlink" onClick={() => set(!on)}>
      <span className="tlink-text">{on ? "Switch off the UV lamp" : "Switch on the UV lamp"}</span>
    </button>
  )
}
