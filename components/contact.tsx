import { SectionHeader } from "@/components/ui/section-header"
import { TextLink } from "@/components/ui/text-link"
import { CopyEmail } from "@/components/copy-email"
import { personalInfo, venture } from "@/data/portfolio"

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section">
      <div className="wrap">
        <SectionHeader id="contact" label="contact" title="Get in touch" />
        <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
          <a href={`mailto:${personalInfo.email}`} className="t-display-m contact-email">
            {personalInfo.email}
          </a>
          <CopyEmail email={personalInfo.email} />
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-10">
          <li>
            <TextLink href={personalInfo.github} external>
              GitHub
            </TextLink>
          </li>
          <li>
            <TextLink href={personalInfo.linkedin} external>
              LinkedIn
            </TextLink>
          </li>
          <li>
            <TextLink href={venture.url} external>
              axonsecurity.tech
            </TextLink>
          </li>
        </ul>
      </div>
    </section>
  )
}
