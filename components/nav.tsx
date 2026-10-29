"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Mark } from "@/components/ui/mark"
import { Pill } from "@/components/ui/pill"
import { ExtLink } from "@/components/ui/ext-link"
import { LocalTime } from "@/components/local-time"
import { LampToggle } from "@/components/lamp-toggle"
import { getLenis, scrollToTarget } from "@/lib/lenis"
import { personalInfo, projects, venture } from "@/data/portfolio"
import { chapters, type Ink } from "@/data/story"

type Link = { href: string; label: string; ink: Ink }

const LINKS: Link[] = [
  ...chapters.map((c) => ({ href: `#${c.id}`, label: String(c.from), ink: c.ink })),
  { href: "#work", label: "work", ink: "uv" },
  { href: "#axon", label: "now", ink: "lime" },
  { href: "#contact", label: "contact", ink: "uv" },
]

// "Aug 2026 – Present" -> "since aug 2026"
const since = `since ${venture.period.split(" – ")[0].toLowerCase()}`

// CONFIRM(malak): menu labels and hints
const MENU: (Link & { hint: string })[] = [
  ...chapters.map((c) => ({
    href: `#${c.id}`,
    label: c.from === c.to ? `${c.from}` : `${c.from}–${c.to}`,
    hint: `ch. ${c.n}`,
    ink: c.ink,
  })),
  { href: "#work", label: "Workbench", hint: String(projects.length).padStart(2, "0"), ink: "uv" },
  { href: "#axon", label: "Now: Axon", hint: since, ink: "lime" },
  { href: "#contact", label: "Contact", hint: "email", ink: "uv" },
]

const nextFrame = (fn: () => void) =>
  typeof window.requestAnimationFrame === "function" ? window.requestAnimationFrame(fn) : window.setTimeout(fn, 16)

export function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLSpanElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Scrolled state: a 1px sentinel at the top of <main>; no scroll listener, one re-render per crossing.
  useEffect(() => {
    const sentinel = document.getElementById("nav-sentinel")
    if (!sentinel) return
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))
    io.observe(sentinel)
    return () => io.disconnect()
  }, [])

  // ≥1280 the hidden pill is out of flow so the status sits on the content edge at the top of the page; once
  // scrolled, the status slides left by the pill's measured width (globals.css .nav-status / .nav-cta).
  useEffect(() => {
    const header = headerRef.current
    const cta = ctaRef.current
    if (!header || !cta) return
    const measure = () => header.style.setProperty("--cta-w", `${cta.offsetWidth}px`)
    measure()
    document.fonts?.ready.then(measure, () => {})
    const ro = new ResizeObserver(measure)
    ro.observe(cta)
    return () => ro.disconnect()
  }, [])

  // Active section: one re-render per section change. The header takes the active chapter's ink.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`)
      },
      { rootMargin: "-40% 0px -55% 0px" },
    )
    // Sections without a nav link still set the ink (UV), so the header never keeps a previous chapter's ink.
    const watched = [...LINKS.map((l) => l.href), "#top", "#preface", "#toolkit"]
    watched.forEach((href) => {
      const el = document.querySelector(href)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false)
    document.documentElement.style.overflow = ""
    getLenis()?.start()
    if (returnFocus) btnRef.current?.focus()
  }, [])

  const openMenu = () => {
    setOpen(true)
    getLenis()?.stop()
    document.documentElement.style.overflow = "hidden"
    nextFrame(() => menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus())
  }

  // While open: Escape closes, Tab is trapped inside the sheet + toggle, desktop width closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close(true)
        return
      }
      if (e.key !== "Tab" || !menuRef.current || !btnRef.current) return
      const items = [
        ...menuRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
        btnRef.current,
      ]
      // The toggle precedes the sheet in DOM order, so native Tab order would leak out of the dialog:
      // every Tab is handled here and cycles through [sheet focusables..., toggle].
      e.preventDefault()
      const idx = items.indexOf(document.activeElement as HTMLElement)
      const next = idx === -1 ? (e.shiftKey ? items.length - 1 : 0) : idx + (e.shiftKey ? -1 : 1)
      items[(next + items.length) % items.length].focus()
    }
    const wide = window.matchMedia("(min-width: 1024px)")
    const onWide = () => wide.matches && close(false)
    document.addEventListener("keydown", onKey)
    wide.addEventListener("change", onWide)
    return () => {
      document.removeEventListener("keydown", onKey)
      wide.removeEventListener("change", onWide)
    }
  }, [open, close])

  const onMenuLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    close(false)
    nextFrame(() => {
      scrollToTarget(href)
      document.querySelector<HTMLElement>(`${href}-title`)?.focus({ preventScroll: true })
    })
  }

  const ink = LINKS.find((l) => l.href === active)?.ink ?? "uv"

  return (
    <header ref={headerRef} className="nav" data-scrolled={scrolled} data-ink={ink}>
      <div className="wrap nav-inner">
        <a href="#top" className="nav-home" aria-label="Malak Mekyassi, home">
          <Mark className="h-[22px] w-[26.4px]" />
          <span className="nav-word">Malak Mekyassi</span>
        </a>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.href} data-ink={l.ink}>
                <a href={l.href} aria-current={active === l.href ? "location" : undefined}>
                  <span className="sq" aria-hidden="true" />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-right">
          <LampToggle className="hidden md:inline-flex" />
          <p className="nav-status t-label hidden min-[1440px]:flex">
            <span className="sq nav-live" aria-hidden="true" />
            building axon security
          </p>
          {/* Accent rationing: the hero has its own "Email me" pill, so this one only appears once the nav is in its
              scrolled state. Hidden = inert + visibility:hidden, so keyboard users never reach an invisible link. */}
          <span ref={ctaRef} className="nav-cta hidden sm:inline-flex" inert={!scrolled}>
            <Pill href={`mailto:${personalInfo.email}`} small>
              Email me
            </Pill>
          </span>
          <button
            ref={btnRef}
            type="button"
            className="nav-toggle lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => (open ? close(true) : openMenu())}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
      <div
        id="site-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="menu"
        data-open={open}
        inert={!open}
      >
        <ul>
          {MENU.map((m, i) => (
            <li key={m.href} data-ink={m.ink}>
              <a
                href={m.href}
                className="menu-link"
                style={{ "--i": i } as React.CSSProperties}
                onClick={(e) => onMenuLink(e, m.href)}
              >
                <span className="flex items-baseline gap-4 whitespace-nowrap">
                  <span className="sq" aria-hidden="true" />
                  {m.label}
                </span>
                <span className="hint">
                  {m.hint.startsWith("since ") ? (
                    <>
                      {/* "since" drops on narrow phones so "Now: Axon" stays on one line */}
                      <span className="hint-since">since </span>
                      {m.hint.slice(6)}
                    </>
                  ) : (
                    m.hint
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="menu-foot flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-t border-hairline pt-4">
          <div className="flex flex-col">
            <a href={`mailto:${personalInfo.email}`} className="t-label text-paper">
              {personalInfo.email}
            </a>
            <div className="flex gap-6">
              <ExtLink href={personalInfo.github} className="t-label text-ghost">
                GitHub
              </ExtLink>
              <ExtLink href={personalInfo.linkedin} className="t-label text-ghost">
                LinkedIn
              </ExtLink>
            </div>
            <LampToggle />
          </div>
          <p className="flex items-center gap-3 pb-3">
            <span className="t-label text-faint">casablanca</span>
            <LocalTime />
          </p>
        </div>
      </div>
    </header>
  )
}
