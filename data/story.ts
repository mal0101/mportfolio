import type { PhotoId } from "@/data/photos"

export type Ink = "uv" | "cyan" | "magenta" | "orange" | "yellow" | "lime"

export interface ChapterMeta {
  id: string
  n: number
  from: number
  to: number
  ink: Ink
  title: string
  lede: string
}

/** Extra story detail attached to an existing data entry, keyed by lib/story.ts entry keys. */
export interface Note {
  when?: string
  team?: string
  extra?: string
  quote?: string
  aside?: string
  figures?: PhotoId[]
}

// CONFIRM(malak): chapter titles and ledes (new copy; every clause is sourced from data/portfolio.ts or LinkedIn roles).
// Wins, roles and major projects only: talks, workshops and events stay on LinkedIn (Malak, 2026-10-23).
export const chapters: ChapterMeta[] = [
  {
    id: "y2022",
    n: 1,
    from: 2022,
    to: 2023,
    ink: "cyan",
    title: "Foundation",
    lede: "Preparatory classes at Arts & Métiers Casablanca, Rotaract member then president.",
  },
  {
    id: "y2024",
    n: 2,
    from: 2024,
    to: 2024,
    ink: "magenta",
    title: "First build",
    lede: "FIRST4COM internship, entry to the AI & Software Engineering track, and AI training from November.",
  },
  {
    id: "y2025",
    n: 3,
    from: 2025,
    to: 2025,
    ink: "orange",
    title: "In production",
    lede: "Production RAG chatbot at NowEdge, with Dell STEM Aspire and McKinsey Forward mentorships.",
  },
  {
    id: "y2026",
    n: 4,
    from: 2026,
    to: 2026,
    ink: "yellow",
    title: "Ship under pressure",
    lede: "Three hackathons, an exhibit at UM6P, a seat on the student council, and a summer at Capgemini Engineering.",
  },
]

export const notes: Record<string, Note> = {
  "hackathon:AgorAI": {
    when: "Mar 2026",
    team: "Team Grey Matter.",
    extra: "Exhibited at the Spring School – AI For Impact, UM6P Benguerir, 23–25 March 2026.",
    quote: "We developed Aegis to bridge a critical gap in Morocco's AI landscape.",
    figures: ["aegis-poster"],
  },
  "hackathon:Mistral AI Worldwide Hackathon": {
    when: "2026", // CONFIRM(malak): month
    team: "Team XCoders, with Hany El Atlassi.", // [LI]
    extra: "Top 10 out of 200+ projects in the public vote.", // [LI] teammate's post. CONFIRM(malak)
    quote: "Landing in the Top 10 worldwide is an incredible feeling.", // [LI]
  },
  "hackathon:HackAI": {
    when: "14–17 May 2026", // [LI] poster
    team: "Team Grey Matter, with Hany El Atlassi and Bahiya Cheikh Mohamed Fadel.", // [LI]
    quote: "This 4-day sprint was unique.", // [LI]
    // [NEW] not stated in any source (linguistically accurate). CONFIRM(malak) before publishing
    aside: "Lfla7 is Darija for “the farmer”.",
    figures: ["jarvislfla7-slide"],
  },
}
