import type React from "react"

/** Every external link in the site goes through this: new tab, no opener, and an announced "(opens in a new tab)". */
export function ExtLink({
  href,
  children,
  className,
  label,
}: {
  href: string
  children: React.ReactNode
  className?: string
  /** Full accessible name; must itself include "(opens in a new tab)". */
  label?: string
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
      {children}
      {label ? null : <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}
