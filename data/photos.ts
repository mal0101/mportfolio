import type { StaticImageData } from "next/image"
import portrait from "@/assets/photos/malak-portrait.jpg"
import poster from "@/assets/photos/aegis-poster.jpg"
import jarvis from "@/assets/photos/jarvislfla7-slide.jpg"

// Wins only — refined to keep the work, drop the paperwork.
export type PhotoId = "portrait" | "aegis-poster" | "jarvislfla7-slide"

export const photos: Record<PhotoId, { img: StaticImageData; alt: string; caption?: string }> = {
  portrait: { img: portrait, alt: "Portrait of Malak Mekyassi" },
  "aegis-poster": {
    img: poster,
    alt: "Malak Mekyassi standing next to the Aegis research poster at the Spring School – AI For Impact.",
    caption: "Aegis at the Spring School – AI For Impact, UM6P Benguerir, 23–25 March 2026.",
  },
  "jarvislfla7-slide": {
    img: jarvis,
    alt: "A title slide reading “Jarvis Lfla7” and “Grey Matter” over a green hillside, with the HackAI sponsor logos along the top.",
    caption: "JarvisLfla7 — voice-first for Moroccan farmers.",
  },
}
