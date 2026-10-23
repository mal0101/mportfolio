import {
  education,
  experiences,
  hackathons,
  leadership,
  type Education,
  type Experience,
  type Hackathon,
  type Leadership,
} from "@/data/portfolio"
import { chapters, notes, type ChapterMeta, type Note } from "@/data/story"

type Base = { key: string; start: string; note?: Note }
export type Entry =
  | (Base & { kind: "school"; item: Education })
  | (Base & { kind: "role"; item: Experience })
  | (Base & { kind: "community"; item: Leadership })
  | (Base & { kind: "hackathon"; item: Hackathon })

export type Chapter = ChapterMeta & { entries: Entry[] }

// Same-month tie-break: school, then work, then community, then hackathons.
const ORDER: Record<Entry["kind"], number> = { school: 0, role: 1, community: 2, hackathon: 3 }
const yearOf = (start: string) => Number(start.slice(0, 4))

/** Every dated entry in the data, with its story note attached. The venture (Axon) is not an entry: it is "now". */
export function allEntries(): Entry[] {
  const list: Entry[] = [
    ...education.map((item): Entry => ({ kind: "school", key: `school:${item.degree}`, start: item.start, item })),
    ...experiences.map(
      (item): Entry => ({ kind: "role", key: `role:${item.company}:${item.role}`, start: item.start, item }),
    ),
    ...leadership.map(
      (item): Entry => ({
        kind: "community",
        key: `community:${item.organization}:${item.role}`,
        start: item.start,
        item,
      }),
    ),
    ...hackathons.map((item): Entry => ({ kind: "hackathon", key: `hackathon:${item.name}`, start: item.start, item })),
  ]
  return list.map((e) => ({ ...e, note: notes[e.key] }) as Entry)
}

/** Chapters with their entries in story order (oldest first). */
export function buildChapters(): Chapter[] {
  const entries = allEntries()
  return chapters.map((c) => {
    const inChapter = (start: string) => yearOf(start) >= c.from && yearOf(start) <= c.to
    return {
      ...c,
      entries: entries
        .filter((e) => inChapter(e.start))
        .sort((a, b) => a.start.localeCompare(b.start) || ORDER[a.kind] - ORDER[b.kind]),
    }
  })
}

export const yearsLabel = (c: { from: number; to: number }) => (c.from === c.to ? `${c.from}` : `${c.from}–${c.to}`)
