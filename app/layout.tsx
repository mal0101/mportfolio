import type React from "react"
import type { Metadata, Viewport } from "next"
import { Hubot_Sans, Martian_Mono, Newsreader } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "lenis/dist/lenis.css"
import "./globals.css"
import { siteConfig } from "@/data/site"
import { personalInfo, venture, education } from "@/data/portfolio"
import { BOOT } from "@/lib/intro"

const hubot = Hubot_Sans({ subsets: ["latin"], axes: ["wdth"], variable: "--font-hubot", display: "swap" })
const martian = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-martian", display: "swap" })
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "profile",
  },
  twitter: { card: "summary_large_image", title: siteConfig.title, description: siteConfig.description },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = { themeColor: siteConfig.themeColor, colorScheme: "dark" }

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: personalInfo.name,
  url: siteConfig.url,
  jobTitle: venture.role,
  worksFor: { "@type": "Organization", name: venture.legalName, url: venture.url },
  alumniOf: { "@type": "CollegeOrUniversity", name: education[0].school },
  homeLocation: { "@type": "Place", name: personalInfo.location },
  email: personalInfo.email,
  sameAs: [personalInfo.github, personalInfo.linkedin],
  description: personalInfo.description,
  knowsAbout: [
    "AI agent security",
    "Machine Learning",
    "Deep Learning",
    "Reinforcement Learning",
    "NLP",
    "Adversarial ML",
    "Software Engineering",
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${hubot.variable} ${martian.variable} ${newsreader.variable}`}>
      <head>
        {/* Parser-blocking, ~1.2 KB: decides the opening sequence and restores the UV lamp before first paint. */}
        <script id="mm-boot" dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Analytics />
      </body>
    </html>
  )
}
