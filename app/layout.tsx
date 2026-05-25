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

export const metadata: Metadata = {
  title: "Malak Mekyassi | AI & Software Engineering",
  description: "AI & Software Engineering student building production ML systems, RAG pipelines, and defensive ML security solutions. Based in Casablanca, Morocco.",
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${geistMono.variable} bg-black`}>
      <body className="font-sans antialiased overflow-x-hidden bg-black">
        <div className="noise-overlay" />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
