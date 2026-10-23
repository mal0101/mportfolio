// "1st Place" -> "1st", "2nd Place" -> "2nd", "Top 10 Globally" -> "Top 10". Display only; the full string is also rendered.
export function shortPlacement(placement: string): string {
  return placement.replace(/\s+(Place|Globally)$/i, "")
}
