"use client"

import { useEffect } from "react"

// Replaces the root layout when it fails, so globals.css and the fonts are not available: inline styles only.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          padding: "0 20px",
          textAlign: "center",
          background: "#0b0a0f",
          color: "#efedf5",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          colorScheme: "dark",
        }}
      >
        <main>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 800, letterSpacing: "-0.03em" }}>
            Something went wrong
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: "0.16em",
                height: "0.16em",
                marginLeft: "0.04em",
                background: "#9469ff",
              }}
            />
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: 14, color: "rgba(239,237,245,0.52)" }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 32,
              height: 52,
              padding: "0 22px",
              border: 0,
              borderRadius: 999,
              background: "#9469ff",
              color: "#0b0a0f",
              font: "600 13px/1 ui-monospace, SFMono-Regular, Menlo, monospace",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
