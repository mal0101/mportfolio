// The "malakmekyassi" microprint is drawn by CSS (.microprint background, an SVG data URI): no text in the DOM.
export function Microprint({ className }: { className?: string }) {
  return <div aria-hidden="true" className={className ? `microprint ${className}` : "microprint"} data-reveal="rule" />
}
