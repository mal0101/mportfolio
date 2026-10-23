import { TextLink } from "@/components/ui/text-link"

export default function NotFound() {
  return (
    <main id="main" className="wrap grid min-h-svh place-items-center text-center">
      <div className="flex flex-col items-center">
        <h1 className="t-display-l">
          This page doesn&apos;t exist
          <span className="full-stop" aria-hidden="true" />
        </h1>
        <p className="t-label mt-4 text-faint">The link may be old or mistyped.</p>
        <div className="mt-6">
          <TextLink href="/">Go to the homepage</TextLink>
        </div>
      </div>
    </main>
  )
}
