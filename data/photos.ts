import type { StaticImageData } from "next/image"
import portrait from "@/assets/photos/malak-portrait.jpg"
import poster from "@/assets/photos/aegis-poster.jpg"
import invitation from "@/assets/photos/agorai-invitation.jpg"
import greyMatter from "@/assets/photos/hackai-grey-matter.jpg"
import jarvis from "@/assets/photos/jarvislfla7-slide.jpg"

// Wins only (Malak, 2026-10-23: no workshop or event photos). Photos from Malak's own LinkedIn (linkedin-facts.md), cropped and stripped of metadata (PLAN-v2 §2). Alt text
// describes what is visible; captions name only people she names publicly (Hany El Atlassi, Bahiya Cheikh Mohamed
// Fadel) and quote slide text verbatim.
export type PhotoId = "portrait" | "aegis-poster" | "agorai-invitation" | "hackai-grey-matter" | "jarvislfla7-slide"

export const photos: Record<PhotoId, { img: StaticImageData; alt: string; caption?: string }> = {
  portrait: { img: portrait, alt: "Portrait of Malak Mekyassi" },
  "aegis-poster": {
    img: poster,
    alt: "Malak Mekyassi standing next to the Aegis research poster at the Spring School – AI For Impact.",
    // [D] from [LI] (her post + the winners' letter); per Malak 2026-10-23 the photo belongs to the AgorAI win story
    caption:
      "Exhibiting Aegis, the AgorAI-winning project, at the Spring School – AI For Impact, UM6P Benguerir, 23–25 March 2026.",
  },
  "agorai-invitation": {
    img: invitation,
    alt: "Invitation letter titled “Invitation Letter - Winner AgorAI Hackathon”, announcing that team Grey Matter was selected among the winners and inviting the team to exhibit at UM6P Benguerir Campus from 23 to 25 March.",
    caption: "The AgorAI winners' letter to team Grey Matter.", // [D]
  },
  "hackai-grey-matter": {
    img: greyMatter,
    alt: "Bahiya Cheikh Mohamed Fadel, Malak Mekyassi and Hany El Atlassi holding certificates on stage at HackAI.",
    caption: "Grey Matter on stage at HackAI: Bahiya Cheikh Mohamed Fadel, Malak Mekyassi and Hany El Atlassi.", // [LI]
  },
  "jarvislfla7-slide": {
    img: jarvis,
    alt: "A title slide reading “Jarvis Lfla7” and “Grey Matter” over a green hillside, with the HackAI sponsor logos along the top.",
    caption: "The JarvisLfla7 title slide.", // [D]
  },
}
