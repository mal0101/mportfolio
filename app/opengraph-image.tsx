import { renderOg } from "@/lib/og"

export const alt = "Malak Mekyassi, co-founder and co-CEO of Axon Security" // CONFIRM(malak)
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return renderOg(size)
}
