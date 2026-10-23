import { describe, expect, it } from "vitest"
import { allEntries, buildChapters } from "@/lib/story"
import { education, experiences, hackathons, leadership } from "@/data/portfolio"
import { notes } from "@/data/story"
import { photos } from "@/data/photos"

const titleOf = (e: ReturnType<typeof allEntries>[number]) =>
  e.kind === "school"
    ? e.item.degree
    : e.kind === "role"
      ? e.item.company
      : e.kind === "community"
        ? e.item.organization
        : e.item.name

describe("story", () => {
  const chapters = buildChapters()

  it("has four chapters in calendar order with distinct inks", () => {
    expect(chapters.map((c) => c.id)).toEqual(["y2022", "y2024", "y2025", "y2026"])
    expect(new Set(chapters.map((c) => c.ink)).size).toBe(4)
    expect(chapters.map((c) => c.ink)).not.toContain("lime")
  })

  it("places every dated entry exactly once, in the chapter of its start year", () => {
    const placed = chapters.flatMap((c) => c.entries)
    const expected = education.length + experiences.length + leadership.length + hackathons.length
    expect(placed).toHaveLength(expected)
    expect(new Set(placed.map((e) => e.key)).size).toBe(expected)
    for (const c of chapters)
      for (const e of c.entries) {
        const y = Number(e.start.slice(0, 4))
        expect(y >= c.from && y <= c.to).toBe(true)
      }
  })

  it("orders entries oldest first inside each chapter", () => {
    for (const c of chapters) {
      const starts = c.entries.map((e) => e.start)
      expect(starts).toEqual([...starts].sort())
    }
    expect(chapters[2].entries.map(titleOf)).toEqual([
      "3D Smart Factory",
      "NowEdge",
      "Dell STEM Aspire Program",
      "McKinsey Forward Program",
      "WOMEN IN TECH® Global",
    ])
    expect(chapters[3].entries.map(titleOf)).toEqual([
      "Student Council ADE",
      "AgorAI",
      "Mistral AI Worldwide Hackathon",
      "Rewriting The Code (RTC)",
      "HackAI",
      "Capgemini Engineering",
    ])
  })

  it("tells wins, roles and projects only (no events or certificates, Malak 2026-10-23)", () => {
    expect(new Set(allEntries().map((e) => e.kind))).toEqual(new Set(["school", "role", "community", "hackathon"]))
    expect(Object.keys(photos).sort()).toEqual([
      "aegis-poster",
      "agorai-invitation",
      "hackai-grey-matter",
      "jarvislfla7-slide",
      "portrait",
    ])
  })

  it("attaches every note to a real entry and every figure to a real photo", () => {
    const keys = new Set(allEntries().map((e) => e.key))
    for (const k of Object.keys(notes)) expect(keys.has(k), k).toBe(true)
    const figs = Object.values(notes).flatMap((n) => n.figures ?? [])
    for (const f of figs) expect(photos[f]).toBeDefined()
    expect(new Set(figs).size).toBe(figs.length) // each photo appears once
    expect(figs).toHaveLength(Object.keys(photos).length - 1) // every photo but the hero portrait is a figure
  })

  it("gives every photo factual alt text and a caption (except the portrait)", () => {
    for (const [id, p] of Object.entries(photos)) {
      expect(p.alt.length).toBeGreaterThan(10)
      if (id !== "portrait") expect(p.caption).toBeTruthy()
    }
  })
})
