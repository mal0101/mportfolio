import type React from "react"
import { ArrowUpRight } from "@/components/ui/icons"
import { ExtLink } from "@/components/ui/ext-link"

export function TextLink({
  href,
  children,
  external,
  label,
  className,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
  /** Full accessible name for external links (include "(opens in a new tab)"). */
  label?: string
  className?: string
}) {
  const cls = className ? `tlink ${className}` : "tlink"
  const text = <span className="tlink-text">{children}</span>
  return external ? (
    <ExtLink href={href} className={cls} label={label}>
      {text}
      <ArrowUpRight size={12} />
    </ExtLink>
  ) : (
    <a href={href} className={cls}>
      {text}
    </a>
  )
}
