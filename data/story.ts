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
    title: "Arts & Métiers Casablanca",
    lede: "Two years of preparatory classes in engineering, and a seat at Rotaract that became its presidency.",
  },
  {
    id: "y2024",
    n: 2,
    from: 2024,
    to: 2024,
    ink: "magenta",
    title: "From prep classes to AI",
    lede: "A summer engineering internship at FIRST4COM, the start of the AI & Software Engineering track, and AI training work from November.",
  },
  {
    id: "y2025",
    n: 3,
    from: 2025,
    to: 2025,
    ink: "orange",
    title: "Into production",
    // [NEW] rewritten after the 2026-10-23 curation (events removed). CONFIRM(malak)
    lede: "Machine learning at 3D Smart Factory, a production RAG chatbot at NowEdge, and two mentorships: Dell STEM Aspire and the McKinsey Forward Program.",
  },
  {
    id: "y2026",
    n: 4,
    from: 2026,
    to: 2026,
    ink: "yellow",
    title: "Under a deadline",
    lede: "Three hackathons, an exhibit at UM6P, a seat on the student council, and a summer at Capgemini Engineering.",
  },
]

export const notes: Record<string, Note> = {
  "hackathon:AgorAI": {
    when: "Mar 2026", // [D] the winners' exhibit month (23–25 March 2026, [LI]). CONFIRM(malak): hackathon month
    team: "Team Grey Matter.", // [LI]
    extra: "Exhibited at the Spring School – AI For Impact, UM6P Benguerir, 23–25 March 2026.", // [D] from [LI]
    quote: "We developed Aegis to bridge a critical gap in Morocco's AI landscape.", // [LI]
    figures: ["aegis-poster", "agorai-invitation"],
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
    figures: ["hackai-grey-matter", "jarvislfla7-slide"],
  },
}
