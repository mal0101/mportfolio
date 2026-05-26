import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const title = "Malak Mekyassi | AI & Software Engineering"
const description =
  "AI & Software Engineering student building production ML systems, RAG pipelines, and defensive ML security solutions. Based in Casablanca, Morocco."
const url = "https://malakmekyassi.com"

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url,
    siteName: "Malak Mekyassi",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Malak Mekyassi",
  url,
  jobTitle: "AI & Software Engineering Student",
  email: "mmekyassi@gmail.com",
  alumniOf: "ENSAM Casablanca",
  knowsAbout: [
    "Machine Learning",
    "Deep Learning",
    "Reinforcement Learning",
    "NLP",
    "Adversarial ML",
    "Software Engineering",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${geistMono.variable} bg-black`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="font-sans antialiased overflow-x-hidden bg-black">
        <div className="noise-overlay" aria-hidden="true" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
