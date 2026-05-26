"use client"

import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-black">
      <h1 className="font-sans text-4xl md:text-5xl font-light text-white">Something went wrong</h1>
      <p className="font-mono text-sm text-gray-500 max-w-md text-center">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="font-mono text-xs tracking-widest px-6 py-3 border border-gray-700 text-white hover:bg-white hover:text-black transition-colors duration-300"
      >
        TRY AGAIN
      </button>
    </div>
  )
}
