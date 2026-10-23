// Axon Security's own A-mark path (axon-design.md §5). CONFIRM(malak): use of the Axon mark on the personal site.
export function AxonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <path
        d="M14 80 L50 20 L86 80 M31 58 H43 M57 58 H69"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="11"
        strokeLinecap="square"
      />
    </svg>
  )
}
