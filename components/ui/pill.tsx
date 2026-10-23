import type React from "react"
import { ArrowUpRight } from "@/components/ui/icons"
import { ExtLink } from "@/components/ui/ext-link"

export function Pill({
  href,
  children,
  external,
  small,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
  small?: boolean
}) {
  const className = small ? "pill pill-sm" : "pill"
  const inner = (
    <>
      <span>{children}</span>
      <span className="pill-icon">
        <ArrowUpRight size={16} />
      </span>
    </>
  )
  return external ? (
    <ExtLink href={href} className={className}>
      {inner}
    </ExtLink>
  ) : (
    <a href={href} className={className}>
      {inner}
    </a>
  )
}
