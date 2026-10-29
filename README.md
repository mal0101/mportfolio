# mmalak.dev

Portfolio of Malak Mekyassi, live at https://mmalak.dev.

## Stack

- Next 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Vitest 4 + Testing Library (jsdom)
- pnpm, deployed on Vercel from `main` (with `@vercel/analytics`)

## Commands

| Command               | What it does                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`            | Start the Next dev server                                                                                                                           |
| `pnpm build`          | Production build                                                                                                                                    |
| `pnpm start`          | Serve the production build                                                                                                                          |
| `pnpm lint`           | ESLint, zero warnings allowed                                                                                                                       |
| `pnpm format`         | Prettier, write mode                                                                                                                                |
| `pnpm test`           | Run Vitest once                                                                                                                                     |
| `pnpm test:watch`     | Vitest in watch mode                                                                                                                                |
| `pnpm portrait:tones` | Run `scripts/portrait-tones.mjs`: reads `assets/photos/malak-portrait.jpg` and regenerates `lib/portrait-tones.ts`. Rerun when the portrait changes |

`pnpm install` runs `husky` (the `prepare` script). The pre-commit hook runs `lint-staged`: Prettier and ESLint `--fix` on staged `*.ts`/`*.tsx`, and Prettier on `*.json`, `*.md`, `*.css` and `*.mjs`.

## Layout

- `app/`: App Router routes, layout, error pages, OG/Twitter/icon images, robots and sitemap, global CSS
- `components/`: page sections and behaviour (hero, intro, nav, work, axon, toolkit, contact, and so on)
- `components/ui/`: small shared pieces (marks, pills, links, icons, section headers)
- `lib/`: helpers (intro logic, hero layout, portrait, placement, links, OG rendering)
- `data/`: all content: `portfolio.ts`, `story.ts`, `photos.ts`, `site.ts`
- `assets/photos/`: source photos
- `public/partners/`: partner logos
- `scripts/`: build-time helper scripts
- `__tests__/`: Vitest suites

## Design docs

`DESIGN.md` is the source of truth for the design system and the changelog.

## Content conventions

- Copy marked `CONFIRM(malak)` is unverified until Malak confirms it. Do not remove a marker before then.
- The data-source tags `[U]`, `[V]` and `[LI]` are explained in `DESIGN.md` section 9.

## Opening animation QA

On `/`, the `?intro=` URL parameter forces the opening sequence: `?intro=off` skips it, `?intro=full` and `?intro=short` force that mode and skip the readiness budget (no switch to short, no abort; the overlay still waits for fonts and the portrait).
