import type { Metadata } from "next"
import { TextLink } from "@/components/ui/text-link"

// CONFIRM(malak): 404 copy
export const metadata: Metadata = {
  title: "Page not found — Malak Mekyassi",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
}

export default function NotFound() {
  return (
    <main id="main" className="wrap grid min-h-svh place-items-center text-center">
      <div className="flex flex-col items-center">
        <h1 className="t-display-l">
          Nothing in the low bits
          <span className="full-stop" aria-hidden="true" />
        </h1>
        <p className="t-label mt-4 text-faint">This page doesn&apos;t exist. The link may be old or mistyped.</p>
        <div className="mt-6">
          <TextLink href="/">Go to the homepage</TextLink>
        </div>
      </div>
    </main>
  )
}
