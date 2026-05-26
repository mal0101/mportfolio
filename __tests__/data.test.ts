import { describe, it, expect } from "vitest"
import {
  projects,
  experiences,
  hackathons,
  education,
  skillCategories,
  leadership,
  techItems,
  concepts,
  personalInfo,
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
      expect(project.image).toMatch(/^\//)
      // link is optional — JarvisLfla7 doesn't have one
    }
  })

  it("all experiences have required fields", () => {
    for (const exp of experiences) {
      expect(exp.role).toBeTruthy()
      expect(exp.company).toBeTruthy()
      expect(exp.period).toBeTruthy()
      expect(exp.highlights.length).toBeGreaterThan(0)
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
