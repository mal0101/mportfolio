import { describe, it, expect } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Nav } from "@/components/nav"
import { Hero } from "@/components/hero"
import { Axon } from "@/components/axon"
import { Work } from "@/components/work"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { shortPlacement } from "@/lib/placement"
import { LampToggle } from "@/components/lamp-toggle"
import { Intro } from "@/components/intro"
import { ChapterSection } from "@/components/chapter"
import { Preface } from "@/components/preface"
import { Toolkit } from "@/components/toolkit"
import { buildChapters } from "@/lib/story"
import { hackathons, projects, skillCategories, venture } from "@/data/portfolio"

describe("Nav", () => {
  it("lists the primary anchors in page order", () => {
    render(<Nav />)
    const links = within(screen.getByRole("navigation", { name: "Primary" })).getAllByRole("link")
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "#y2022",
      "#y2024",
      "#y2025",
      "#y2026",
      "#work",
      "#axon",
      "#contact",
    ])
  })

  it("starts in her own ink (UV) and follows the story", () => {
    const { container } = render(<Nav />)
    expect(container.querySelector("header")).toHaveAttribute("data-ink", "uv")
  })

  it("has a named home link", () => {
    render(<Nav />)
    expect(screen.getByRole("link", { name: "Malak Mekyassi, home" })).toHaveAttribute("href", "#top")
  })

  it("shows the founder status, not job-seeking", () => {
    render(<Nav />)
    expect(screen.getByText("building axon security")).toBeInTheDocument()
    expect(screen.queryByText(/available for work/i)).toBeNull()
  })

  it("keeps its Email me pill inert until the nav is scrolled (the hero has its own)", () => {
    const { container } = render(<Nav />)
    const header = container.querySelector("header")
    expect(header).toHaveAttribute("data-scrolled", "false")
    const cta = container.querySelector(".nav-cta")
    expect(cta).toHaveAttribute("inert")
    expect(cta?.querySelector('a[href^="mailto:"]')).not.toBeNull()
  })

  it("has an accessible menu dialog that opens and closes with Escape", async () => {
    const user = userEvent.setup()
    const { container } = render(<Nav />)
    const button = screen.getByRole("button", { name: "Open menu" })
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(button).toHaveAttribute("aria-controls", "site-menu")
    await user.click(button)
    expect(button).toHaveAttribute("aria-expanded", "true")
    expect(button).toHaveAccessibleName("Close menu")
    expect(container.querySelector("#site-menu")).toHaveAttribute("role", "dialog")
    await user.keyboard("{Escape}")
    expect(button).toHaveAttribute("aria-expanded", "false")
  })
})

describe("Hero", () => {
  it("renders the name as the h1", () => {
    render(<Hero />)
    expect(screen.getByRole("heading", { level: 1, name: "Malak Mekyassi" })).toBeInTheDocument()
  })

  it("renders the role line", () => {
    render(<Hero />)
    expect(screen.getByText(/Co-founder & co-CEO,/)).toBeInTheDocument()
  })

  it("has the email and Axon CTAs", () => {
    render(<Hero />)
    expect(screen.getByRole("link", { name: /Email me/ })).toHaveAttribute("href", "mailto:mmekyassi@gmail.com")
    const axon = screen.getByRole("link", { name: /axonsecurity\.tech/ })
    expect(axon).toHaveAttribute("href", "https://axonsecurity.tech")
    expect(axon).toHaveAttribute("target", "_blank")
    expect(axon).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("shows the ID photo with alt text", () => {
    render(<Hero />)
    expect(screen.queryByRole("img", { name: "Portrait of Malak Mekyassi" })).not.toBeInTheDocument()
  })

  it("has no loading UI", () => {
    render(<Hero />)
    expect(screen.queryByText(/loading/i)).toBeNull()
  })
})

describe("Axon", () => {
  it("scopes the guest colour", () => {
    const { container } = render(<Axon />)
    expect(container.querySelector("#axon")).toHaveAttribute("data-guest", "axon")
  })

  it("quotes the tagline verbatim", () => {
    const { container } = render(<Axon />)
    expect(container.querySelector("blockquote")?.textContent).toBe("Agent security for the AI stack you already run.")
  })

  it("renders partner logos", () => {
    render(<Axon />)
    for (const l of venture.logos ?? []) {
      expect(screen.getByAltText(l.alt)).toBeInTheDocument()
    }
  })

  it("renders every principle", () => {
    render(<Axon />)
    for (const p of venture.principles) expect(screen.getByText(p.text)).toBeInTheDocument()
  })
})

describe("Work", () => {
  it("renders one article per project and no images", () => {
    const { container } = render(<Work />)
    expect(screen.getAllByRole("article")).toHaveLength(projects.length)
    expect(container.querySelectorAll("img")).toHaveLength(0)
  })

  it("makes external links safe and named", () => {
    const { container } = render(<Work />)
    const external = container.querySelectorAll("a[target=_blank]")
    expect(external.length).toBeGreaterThan(0)
    external.forEach((a) => {
      expect(a).toHaveAttribute("rel", "noopener noreferrer")
      expect(a).toHaveAccessibleName()
    })
  })
})

describe("shortPlacement", () => {
  it("derives short placements", () => {
    expect(hackathons.map((h) => shortPlacement(h.placement))).toEqual(["1st", "2nd", "Top 10"])
  })
})

describe("LampToggle", () => {
  it("switches the lamp and remembers it", async () => {
    const user = userEvent.setup()
    render(<LampToggle />)
    const btn = screen.getByRole("button", { name: "uv lamp" })
    expect(btn).toHaveAttribute("aria-pressed", "false")
    await user.click(btn)
    expect(btn).toHaveAttribute("aria-pressed", "true")
    expect(document.documentElement.dataset.lamp).toBe("on")
    expect(localStorage.getItem("mm-lamp")).toBe("on")
  })
})

describe("Intro", () => {
  it("is decorative and hidden until the boot script shows it", () => {
    const { container } = render(<Intro />)
    const root = container.querySelector(".intro") as HTMLElement
    expect(root).toHaveAttribute("aria-hidden", "true")
    expect(root.style.display).toBe("none")
    expect(root.querySelectorAll(".intro-fibre")).toHaveLength(36)
    expect(root.querySelectorAll("a, button, [tabindex]")).toHaveLength(0)
  })
})

describe("Chapter", () => {
  const story = buildChapters()
  it("names each chapter with its years for assistive tech", () => {
    render(<ChapterSection chapter={story[3]} />)
    expect(screen.getByRole("heading", { level: 2, name: "2026: Ship under pressure" })).toBeInTheDocument()
    expect(screen.getByText("Jul – Aug 2026")).toBeInTheDocument()
  })
  it("shows every hackathon placement in full", () => {
    render(<ChapterSection chapter={story[3]} />)
    for (const h of hackathons) expect(screen.getByText(h.placement)).toBeInTheDocument()
  })
  it("gives every photo alt text and hides the daylight copy", () => {
    const { container } = render(<ChapterSection chapter={story[3]} />)
    const imgs = [...container.querySelectorAll("img")]
    expect(imgs.length).toBe(4) // 2 photos × 2 layers
    for (const img of imgs) {
      if (img.classList.contains("photo-day")) expect(img).toHaveAttribute("alt", "")
      else expect(img.getAttribute("alt")?.length).toBeGreaterThan(10)
    }
  })
  it("numbers no event photos and renders no certificates", () => {
    const { container } = render(<ChapterSection chapter={story[2]} />)
    expect(container.querySelectorAll("img")).toHaveLength(0)
    expect(container.querySelector(".uv-print")).toBeNull()
  })
})

describe("Preface and Toolkit", () => {
  it("links the contents to every chapter", () => {
    render(<Preface chapters={buildChapters()} />)
    const nav = screen.getByRole("navigation", { name: "Index" })
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"))
    expect(hrefs).toEqual(["#y2022", "#y2024", "#y2025", "#y2026", "#work", "#axon", "#toolkit"])
  })
  it("lists every skill and no certifications", () => {
    render(<Toolkit />)
    for (const c of skillCategories) for (const s of c.skills) expect(screen.getByText(s)).toBeInTheDocument()
    expect(screen.queryByText("Certifications")).toBeNull()
  })
})

describe("Contact", () => {
  it("links email, GitHub and LinkedIn", () => {
    render(<Contact />)
    expect(screen.getByRole("link", { name: "mmekyassi@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:mmekyassi@gmail.com",
    )
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/mal0101")
    expect(screen.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/malak-mekyassi",
    )
  })
})

describe("Footer", () => {
  it("renders labels and the copyright line", () => {
    render(<Footer />)
    expect(screen.getByText("based in")).toBeInTheDocument()
    expect(screen.getByText("elsewhere")).toBeInTheDocument()
    expect(screen.getByText(/Malak Mekyassi\. All rights reserved\./)).toBeInTheDocument()
  })

  it("prints a decorative two-line MRZ instead of DOM microprint", () => {
    const { container } = render(<Footer />)
    const mrz = container.querySelector(".mrz")
    expect(mrz).toHaveAttribute("aria-hidden", "true")
    expect(mrz?.textContent).toBe("MEKYASSI<<MALAK" + "<".repeat(29) + "\nAXON<SECURITY<<CO<FOUNDER<CO<CEO<<CASABLANCA")
    expect(container.textContent).not.toContain("malakmekyassimalak")
  })
})
