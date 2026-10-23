import { Mark } from "@/components/ui/mark"
import { ExtLink } from "@/components/ui/ext-link"
import { TextLink } from "@/components/ui/text-link"
import { LocalTime } from "@/components/local-time"
import { CopyrightYear } from "@/components/copyright-year"
import { LampTextButton } from "@/components/lamp-toggle"
import { personalInfo } from "@/data/portfolio"
import { chapters } from "@/data/story"

const INDEX: [string, string][] = [
  ["#preface", "Preface"],
  ...chapters.map((c): [string, string] => [`#${c.id}`, c.from === c.to ? `${c.from}` : `${c.from}–${c.to}`]),
  ["#work", "Workbench"],
  ["#axon", "Now: Axon"],
  ["#toolkit", "Appendix"],
  ["#contact", "Contact"],
]

/** Passport machine-readable-zone idiom: 44 characters per line, facts only, no document codes. */
function mrz(text: string) {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "<")
    .padEnd(44, "<")
    .slice(0, 44)
}
// CONFIRM(malak): MRZ lines (name; company, roles, city)
const MRZ = [mrz("MEKYASSI  MALAK"), mrz("AXON SECURITY  CO FOUNDER CO CEO  CASABLANCA")].join("\n")

const link = "foot-link t-small text-ghost"

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-hairline-2">
      <div className="wrap pt-14 pb-8">
        <div className="grid-12 gap-y-10 max-md:grid-cols-2">
          <div className="flex items-center gap-3 self-start max-md:col-span-2 md:col-span-6 lg:col-span-4">
            <Mark className="h-[18px] w-[21.6px] flex-none" />
            <p className="t-title">{personalInfo.name}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <p className="t-label text-faint">based in</p>
            <p className="t-small mt-2 text-paper">{personalInfo.location}</p>
            <p className="t-label mt-6 text-faint">local time</p>
            <p className="mt-2">
              <LocalTime />
            </p>
          </div>
          <div className="md:col-span-2 lg:col-span-2">
            <p className="t-label text-faint">elsewhere</p>
            <ul className="mt-1">
              <li>
                <ExtLink href={personalInfo.github} className={link}>
                  GitHub
                </ExtLink>
              </li>
              <li>
                <ExtLink href={personalInfo.linkedin} className={link}>
                  LinkedIn
                </ExtLink>
              </li>
              <li>
                <a href={`mailto:${personalInfo.email}`} className={link}>
                  Email
                </a>
              </li>
            </ul>
          </div>
          <nav aria-label="Index" className="max-md:col-span-2 md:col-span-2 lg:col-span-3">
            <p className="t-label text-faint">index</p>
            <ul className="mt-1 grid grid-cols-2 gap-x-(--gutter)">
              {INDEX.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className={link}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12">
          <p className="mrz" aria-hidden="true">
            {MRZ}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
            <p className="t-label text-faint">
              © <CopyrightYear initial={new Date().getFullYear()} /> Malak Mekyassi. All rights reserved.
            </p>
            {/* CONFIRM(malak): colophon */}
            <p className="t-label flex flex-wrap items-center gap-x-4 text-faint">
              Set in Hubot Sans, Newsreader and Martian Mono.
              <LampTextButton />
            </p>
            <TextLink href="#top">Back to top</TextLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
