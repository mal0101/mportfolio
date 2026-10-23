"use client"

import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="main" className="wrap grid min-h-svh place-items-center text-center">
      <div className="flex flex-col items-center">
        <h1 className="t-display-l">
          Something went wrong
          <span className="full-stop" aria-hidden="true" />
        </h1>
        <p className="t-label mt-4 text-faint">An unexpected error occurred. Please try refreshing the page.</p>
        <button type="button" className="pill mt-8 px-[22px]" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  )
}
