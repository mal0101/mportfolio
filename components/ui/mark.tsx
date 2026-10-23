export function Mark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 120 100"
      className={className}
      {...(title ? { role: "img" } : { "aria-hidden": true })}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M12 86 V16 L46 58 L80 16 V86"
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
      />
      <rect className="mark-stop" x="94" y="72" width="14" height="14" fill="var(--accent)" />
    </svg>
  )
}
