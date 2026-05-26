import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

describe("Navbar", () => {
  it("renders navigation links", () => {
    render(<Navbar />)
    expect(screen.getByText("PORTFOLIO")).toBeInTheDocument()
    expect(screen.getByText("ABOUT")).toBeInTheDocument()
    expect(screen.getByText("WORKS")).toBeInTheDocument()
    expect(screen.getByText("SKILLS")).toBeInTheDocument()
    expect(screen.getByText("CONTACT")).toBeInTheDocument()
  })

  it("shows availability status", () => {
    render(<Navbar />)
    expect(screen.getByText("AVAILABLE FOR WORK")).toBeInTheDocument()
  })

  it("has accessible mobile menu button", () => {
    render(<Navbar />)
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument()
  })
})

describe("Footer", () => {
  it("renders contact section", () => {
    render(<Footer />)
    expect(screen.getByText("EMAIL")).toBeInTheDocument()
    expect(screen.getByText("SOCIALS")).toBeInTheDocument()
    expect(screen.getByText("LOCATION")).toBeInTheDocument()
    expect(screen.getByText("GitHub")).toBeInTheDocument()
    expect(screen.getByText("LinkedIn")).toBeInTheDocument()
  })
})
