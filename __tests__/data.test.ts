import { describe, it, expect } from "vitest"
import {
  about,
  projects,
  experiences,
  hackathons,
  education,
  skillCategories,
  leadership,
  techItems,
  concepts,
  personalInfo,
  venture,
} from "@/data/portfolio"

describe("portfolio data integrity", () => {
  it("personalInfo has all required fields", () => {
    expect(personalInfo.name).toBeTruthy()
    expect(personalInfo.email).toContain("@")
    expect(personalInfo.github).toContain("github.com")
    expect(personalInfo.linkedin).toContain("linkedin.com")
    expect(personalInfo.location).toBeTruthy()
  })

  it("all projects have required fields", () => {
    for (const project of projects) {
      expect(project.title).toBeTruthy()
      expect(project.description).toBeTruthy()
      expect(Array.isArray(project.tags)).toBe(true)
      // link is optional — SXR and HRL have none
    }
  })

  it("all experiences have required fields", () => {
    for (const exp of experiences) {
      expect(exp.role).toBeTruthy()
      expect(exp.company).toBeTruthy()
      expect(exp.period).toBeTruthy()
      expect(["internship", "freelance"]).toContain(exp.type)
      expect(exp.start).toMatch(/^\d{4}-\d{2}$/)
    }
  })

  it("keeps the highlights of the experiences that existed in v1", () => {
    for (const company of ["Capgemini Engineering", "NowEdge", "Outlier AI, Alignerr, Prolific"]) {
      const exp = experiences.find((e) => e.company === company)
      expect(exp?.highlights.length, company).toBeGreaterThan(0)
    }
  })

  it("all hackathons have required fields", () => {
    for (const h of hackathons) {
      expect(h.placement).toBeTruthy()
      expect(h.name).toBeTruthy()
      expect(h.project).toBeTruthy()
    }
  })

  it("all education entries have required fields", () => {
    for (const e of education) {
      expect(e.degree).toBeTruthy()
      expect(e.school).toBeTruthy()
      expect(e.period).toBeTruthy()
    }
  })

  it("all skill categories have skills", () => {
    for (const sc of skillCategories) {
      expect(sc.category).toBeTruthy()
      expect(sc.skills.length).toBeGreaterThan(0)
    }
  })

  it("all leadership entries have required fields", () => {
    for (const l of leadership) {
      expect(l.role).toBeTruthy()
      expect(l.organization).toBeTruthy()
      expect(l.period).toBeTruthy()
    }
  })

  it("techItems and concepts are non-empty", () => {
    expect(techItems.length).toBeGreaterThan(0)
    expect(concepts.length).toBeGreaterThan(0)
  })
})

describe("venture (Axon Security)", () => {
  it("has the verbatim company copy", () => {
    expect(venture.url).toBe("https://axonsecurity.tech")
    expect(venture.tagline).toBe("Agent security for the AI stack you already run.")
    expect(venture.summary.startsWith("Axon discovers every agent in your stack")).toBe(true)
  })

  it("lists the programs exactly as on axonsecurity.tech", () => {
    const items = venture.programs.flatMap((g) => g.items)
    expect(items.map((p) => p.name)).toEqual([
      "HackNation Venture Lab",
      "AWS for Startups",
      "E2B for Startups",
      "Anthropic Cyber Verification Program",
    ])
    for (const p of items) expect(p.url.startsWith("https://")).toBe(true)
  })

  it("has the coverage counts", () => {
    expect(venture.coverage).toEqual({ clients: 10, frameworks: 9 })
  })
})

describe("content guards", () => {
  it("projects carry no image key and only https links", () => {
    for (const p of projects) {
      expect(Object.prototype.hasOwnProperty.call(p, "image")).toBe(false)
      if (p.link) expect(p.link.startsWith("https://")).toBe(true)
    }
  })

  it("personalInfo is founder-first and time-zoned", () => {
    expect(personalInfo.tagline).toContain("Axon Security")
    expect(personalInfo.timeZone).toBe("Africa/Casablanca")
  })

  it("about keeps the two verbatim paragraphs and valid strong spans", () => {
    expect(about).toHaveLength(3)
    expect(about[1].text).toBe(
      "AI & Software Engineering student at Arts & Métiers Casablanca specializing in ML security, reinforcement learning, and AI infrastructure. I build things end-to-end — RAG pipelines, defensive ML tooling, hierarchical RL systems.",
    )
    expect(about[2].text).toBe(
      "2x hackathon winner, including a 1st place recognised at an international AI conference alongside Yann LeCun and Eric Xing.",
    )
    for (const p of about) if (p.strong) expect(p.text).toContain(p.strong)
  })

  it("keeps every entry (guards against accidental content loss)", () => {
    expect(leadership).toHaveLength(7)
    expect(hackathons).toHaveLength(3)
    expect(projects).toHaveLength(6)
    expect(experiences).toHaveLength(5)
    expect(education).toHaveLength(2)
  })

  it("records the end of the Capgemini internship", () => {
    const cap = experiences.find((e) => e.company === "Capgemini Engineering")
    expect(cap?.period).toBe("Jul – Aug 2026")
    expect(cap?.highlights.some((h) => /currently/i.test(h))).toBe(false)
  })

  it("dates Axon from LinkedIn", () => {
    expect(venture.period).toBe("Aug 2026 – Present")
  })

  it("names the school Arts & Métiers Casablanca everywhere", () => {
    const all = JSON.stringify({ about, education, leadership, experiences, hackathons, projects, personalInfo })
    expect(all).toContain("Arts & Métiers Casablanca")
    expect(all).not.toMatch(/ENSAM/i)
    for (const p of about) if (p.strong) expect(p.text).toContain(p.strong)
  })

  it("keeps every sort key well formed", () => {
    for (const x of [...education, ...leadership, ...hackathons]) expect(x.start).toMatch(/^\d{4}-\d{2}$/)
  })
})
