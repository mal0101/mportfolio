# DESIGN.md — mmalak.dev

Single reference for the portfolio's design system. Reconstructed from the code on 2026-10-29 (v3 P0); where this file
and the code disagree, the code wins and this file is the bug. Code comments cite sections here (for example
"DESIGN §5.11"), so keep the numbering stable.

Sources: `app/globals.css`, `app/layout.tsx`, `lib/og.tsx`, `lib/intro.ts`, `components/*`, `data/site.ts`.

## 1. Principles

- **Vibrant on dark.** An almost-black ground (`--ink`) with fluorescent "security inks". One ink per region; the
  accent is rationed (the nav pill only shows once scrolled; the hero has its own pill).
- **Playful and story-like.** The page reads as a story told in chapters (2022-2023, 2024, 2025, 2026), then "now"
  (Axon). The UV lamp is the central metaphor: invisible ink that appears under the cursor, or with the lamp switched on.
- **Nothing "vibecoded".** No generic gradients, no glassmorphism, no emoji templates. The signature details are the
  square full stop, registration marks and corners, microprint, and the "M." mark. Gradients in the CSS are used for
  masks, fades and hairlines (hero rule, field and photo masks, dot texture, the opening's photo feather), not as
  decorative fills.
- **Curation: wins and major projects only.** Talks, workshops and events stay on LinkedIn (decision 2026-10-23, see
  `data/story.ts`). No certificates, no filler.
- **Copy rules** are in §9. In short: "Arts & Métiers Casablanca" (never the abbreviation the guard test forbids);
  Capgemini is Jul – Aug 2026 and never "current"; unverified copy is marked `CONFIRM(malak)`.
- **Performance and restraint.** Canvas and CSS only, no animation libraries. The hero field renders on demand and
  schedules no frames while idle or off-screen.

## 2. Tokens

All tokens live on `:root` in `app/globals.css`. Tailwind's default palette is removed (`--color-*: initial`); only the
tokens below exist as utilities (`ink`, `surface`, `paper`, `ghost`, `faint`, `dim`, `hairline`, `hairline-2`, `accent`).

### 2.1 Colour

| Token                         | Value                           | Notes                                                                                  |
| ----------------------------- | ------------------------------- | -------------------------------------------------------------------------------------- |
| `--ink` / `--ink-rgb`         | `#050509` / `5 5 9`             | page ground                                                                            |
| `--ground` / `--ground-rgb`   | `var(--ink)` / `var(--ink-rgb)` | the background actually painted (html, body, scrolled nav, menu); lamp mode changes it |
| `--surface`                   | `#0f0f15`                       | panels, photo placeholder                                                              |
| `--paper` / `--paper-rgb`     | `#f5f4f9` / `245 244 249`       | text and light ink                                                                     |
| `--uv` / `--uv-rgb`           | `#9469ff` / `148 105 255`       | hers; default accent                                                                   |
| `--cyan` / `--cyan-rgb`       | `#1fe0ff` / `31 224 255`        | chapter 2022-2023                                                                      |
| `--magenta` / `--magenta-rgb` | `#ff3dc8` / `255 61 200`        | chapter 2024                                                                           |
| `--orange` / `--orange-rgb`   | `#ff8424` / `255 132 36`        | chapter 2025                                                                           |
| `--yellow` / `--yellow-rgb`   | `#ffe03a` / `255 224 58`        | chapter 2026                                                                           |
| `--lime` / `--lime-rgb`       | `#95ff2a` / `149 255 42`        | guest ink, Axon only                                                                   |
| `--accent` / `--accent-rgb`   | `var(--uv)` / `var(--uv-rgb)`   | re-declared per `data-ink` scope (§4.1)                                                |
| `--accent-tint`               | `rgb(var(--uv-rgb) / 0.1)`      |                                                                                        |
| `--accent-glow`               | `rgb(var(--uv-rgb) / 0.35)`     |                                                                                        |
| `--ghost`                     | `rgb(var(--paper-rgb) / 0.6)`   | 6.55:1 (code comment); secondary text                                                  |
| `--faint`                     | `rgb(var(--paper-rgb) / 0.48)`  | 4.58:1 (code comment); minimum for text                                                |
| `--dim`                       | `rgb(var(--paper-rgb) / 0.26)`  | 2.06:1 (code comment); decorative only                                                 |
| `--hairline`                  | `rgb(var(--paper-rgb) / 0.1)`   |                                                                                        |
| `--hairline-2`                | `rgb(var(--paper-rgb) / 0.05)`  |                                                                                        |

The code comment on the inks says "every one >= 5.38:1 on ink". That bound is stale but still true: recomputed (WCAG 2.x
relative luminance) from the hex values on 2026-10-29 against `#050509`, the minimum is uv at 5.55; cyan 12.76,
magenta 6.54, orange 8.31, yellow 15.48, lime 16.10 (all pass 4.5:1).

Other literal colours in the CSS: body grain tile uses colour matrix `.937 .929 .961` at alpha `.09`; the microprint
text fill is `#efedf5` at `.3`; scrollbar thumb is `rgb(var(--uv-rgb) / 0.5)`; the nav when scrolled is
`rgb(var(--ground-rgb) / 0.86)`.

### 2.2 Motion tokens

| Token         | Value                            |
| ------------- | -------------------------------- |
| `--ease-out`  | `cubic-bezier(0.16, 1, 0.3, 1)`  |
| `--ease-io`   | `cubic-bezier(0.76, 0, 0.24, 1)` |
| `--ease-snap` | `cubic-bezier(0.5, 0, 0.1, 1)`   |
| `--ease-soft` | `cubic-bezier(0.4, 0, 0.2, 1)`   |
| `--ease-roll` | `cubic-bezier(0.65, 0, 0.3, 1)`  |
| `--dur-1`     | `180ms`                          |
| `--dur-2`     | `450ms`                          |
| `--dur-3`     | `900ms`                          |

`--ease-soft` (a gentle in-out) and `--ease-roll` (the year reel's symmetric in-out) were added for the opening
(§6.1); they live on `:root` because the name's fluoresce runs on `.hero-line`, outside the overlay.

Other durations used directly: background and photo transitions 600ms, rule reveal 1100ms (`--ease-io`), stamp 380ms
(delay 240ms), lamp-strike 320ms.

### 2.3 Layout

| Token         | Value                      |
| ------------- | -------------------------- |
| `--max`       | `1520px`                   |
| `--edge`      | `clamp(20px, 4.4vw, 72px)` |
| `--gutter`    | `clamp(16px, 2vw, 32px)`   |
| `--nav-h`     | `56px`; `64px` from 768px  |
| `--section-y` | `clamp(72px, 8vw, 128px)`  |

`.grid-12`: 1 column on mobile, 6 columns from 768px, 12 from 1024px (column-gap `--gutter`, row-gap 20px, 24px from
768px). Adjacent sections keep only `calc(var(--section-y) * 0.4)` of top padding; the registration row is the divider.
Breakpoints in CSS: max-width 359/639/767px, min-width 768/1024/1440px. `hero-field.tsx` also switches at 768px
(pitch) and 1280px (lens radius) in JS.

### 2.4 Legacy / known drift

Recorded, not changed. These are deliberate-for-now divergences from the tokens above.

- **`#0b0a0f`** is the old ink. It is still used in: `themeColor` (`data/site.ts`), `app/icon.svg`,
  `app/apple-icon.tsx`, the OG image (`lib/og.tsx`, `INK`, with the fade gradient `rgba(11,10,15,0)`),
  `app/global-error.tsx` (background and button text). The live ground is `#050509`. (The torch intro's `intro-room`
  colours and `--ease-sweep` were removed with it in v3.1 P3.)
- **`#efedf5`** (`rgb(239,237,245)`) is the old paper. `components/hero-field.tsx` `PAPER`, `lib/og.tsx`, the icons,
  `global-error.tsx` and the body grain/microprint SVGs use it, versus `--paper` `#f5f4f9`.
- The opening ("Exposure", §6.1) uses tokens only; its canvas reads `--paper-rgb` / `--uv-rgb` with fallbacks.

## 3. Type

Fonts (next/font, in `app/layout.tsx`): **Hubot Sans** (`--font-hubot`, axis `wdth`), **Martian Mono**
(`--font-martian`, axis `wdth`), **Newsreader** italic (`--font-newsreader`, axis `opsz`). Mapped to `--font-sans`,
`--font-mono`, `--font-serif` (with system fallbacks). Width is driven by an animatable `@property --wdth` (number,
inherits) applied through `font-variation-settings: "wdth" var(--wdth)` on every element; mono roles set
`--wdth: 87.5`. Body: 1.0625rem / 1.6, `font-synthesis: none`.

### 3.1 Principles

Display is Hubot, tight and wide-axis tuned; metadata and UI are mono; asides and the voice are serif italic. Numbers in
data use `tabular-nums`.

### 3.2 Roles

| Class           | Font              | Size                                 | Line height | Weight | Other                                           |
| --------------- | ----------------- | ------------------------------------ | ----------- | ------ | ----------------------------------------------- |
| `.t-display-xl` | Hubot             | `clamp(3.25rem, 14vw, 13rem)`        | 0.8         | 820    | tracking -0.048em; `--wdth` 100, 110 from 768px |
| `.t-display-l`  | Hubot             | `clamp(2.5rem, 6.2vw, 6rem)`         | 0.88        | 800    | -0.032em; `--wdth` 84; max 16ch; balance        |
| `.t-display-m`  | Hubot             | `clamp(2rem, 4.2vw, 3.75rem)`        | 0.9         | 760    | -0.03em; `--wdth` 94; balance                   |
| `.t-placement`  | Hubot             | `clamp(3rem, 7vw, 7rem)`             | 0.85        | 800    | -0.02em; `--wdth` 75; tabular-nums              |
| `.t-title`      | Hubot             | `clamp(1.375rem, 2vw, 1.875rem)`     | 1.1         | 650    | -0.02em                                         |
| `.t-lead`       | Hubot             | `clamp(1.125rem, 1.35vw, 1.3125rem)` | 1.45        | body   | -0.005em; `--ghost`; max 52ch                   |
| `.t-body`       | Hubot             | 1.0625rem                            | 1.6         | body   | `--ghost`; max 64ch                             |
| `.t-small`      | Hubot             | 0.9375rem                            | 1.5         | body   | `--ghost`                                       |
| `.t-voice-l`    | Newsreader italic | `clamp(1.25rem, 1.8vw, 1.625rem)`    | 1.2         | body   | -0.01em                                         |
| `.t-voice`      | Newsreader italic | 1.0625rem                            | 1.35        | body   |                                                 |
| `.t-label`      | Martian Mono      | 0.75rem                              | 1.4         | 450    | +0.01em; `--wdth` 87.5                          |
| `.t-data`       | Martian Mono      | 0.8125rem                            | 1.4         | 450    | tabular-nums; `--wdth` 87.5                     |

`strong` inside `.t-display-xl`, `.t-body`, `.t-lead` is `--paper`, weight 560. Other named type: `.chapter-year`
(800, `clamp(6.5rem, 16vw, 17rem)`, line 0.78, `--wdth` 75, accent colour, scroll-stretches to 100),
`.count` (mono 0.8125rem, weight 500, accent), `.nav-word` (700, 15px, `--wdth` 112), `.mrz` (mono, footer MRZ line,
size `min(11px, (100vw - 2 * var(--edge)) / 37)`, 35 below 640px).

## 4. Colour rules

### 4.1 Ink per region

One accent per region via `data-ink` on a section (or nav/menu item). Each `[data-ink]` scope re-declares the whole
derived set (`--accent`, `--accent-rgb`, `--accent-tint`, `--accent-glow`) because custom properties resolve where they
are declared.

| Region                                         | Ink                            |
| ---------------------------------------------- | ------------------------------ |
| Hero, preface, work, toolkit, contact, default | `uv`                           |
| Chapter 2022-2023 (`y2022`)                    | `cyan`                         |
| Chapter 2024 (`y2024`)                         | `magenta`                      |
| Chapter 2025 (`y2025`)                         | `orange`                       |
| Chapter 2026 (`y2026`)                         | `yellow`                       |
| Axon ("now")                                   | `lime` via `data-guest="axon"` |

The cyan, magenta, orange and yellow scopes also define `--fibres`, a 420x420 SVG tile of short curls
(stroke width 1.4, stroke-opacity .7) shown by `.chapter::before` only under the lamp (§4.2).

The accent is used for: the square full stop, `.sq`, `.count`, the pill, link hover, focus rings, selection, the
chapter year. The nav shows each item in its own ink.

### 4.2 Lamp mode and contrast

`html[data-lamp="on"]` (set by `components/lamp-toggle.tsx`, remembered in `localStorage` key `mm-lamp`, restored by the
boot script before first paint) switches on the UV lamp for the whole page:

- `--ground: #0f0a1a` (`15 10 26`), `--surface: #161022`.
- Chapter fibre tile opacity 0.5 (at 1 the curls crossed body copy and hurt legibility; lamp QA 2026-10-23).
- Photos lose the grayscale "daylight" layer (`opacity: 0`).
- Footer MRZ turns UV.
- The hero field draws the hidden portrait (or the fallback mark) at 0.6 (§5.11).

Contrast (WCAG 2.x) of the six inks on the normal ground and on the lamp ground/surface, recomputed from the hex values
on 2026-10-29:

| Ink               | on `#050509` | on `#0f0a1a` | on `#161022` |
| ----------------- | ------------ | ------------ | ------------ |
| uv `#9469ff`      | 5.55         | 5.31         | 5.06         |
| cyan `#1fe0ff`    | 12.76        | 12.20        | 11.64        |
| magenta `#ff3dc8` | 6.54         | 6.26         | 5.97         |
| orange `#ff8424`  | 8.31         | 7.95         | 7.58         |
| yellow `#ffe03a`  | 15.48        | 14.81        | 14.12        |
| lime `#95ff2a`    | 16.10        | 15.40        | 14.69        |

All stay above 4.5:1 in both modes. `--ghost`/`--faint`/`--dim` are `--paper` at an alpha, so their contrast shifts
with the ground. Recomputed (sRGB alpha blend): on `#050509` ghost 6.76, faint 4.63, dim 2.07; on `#0f0a1a` ghost 6.70,
faint 4.63, dim 2.16. The code comments (6.55 / 4.58 / 2.06) are slightly conservative; faint stays above 4.5:1 in both
modes and `--dim` is decorative only.

### 4.3 Guest colour

Lime belongs to Axon and is used nowhere else (`[data-ink="lime"], [data-guest="axon"]`). The Axon panel is a
`--surface` card with a `--hairline` border, four corner marks, and padding `clamp(24px, 4vw, 64px)`; below 768px it
bleeds to the edges.

## 5. Components

Server components unless noted. Helpers live in `components/ui`.

- **5.1 Nav** (`nav.tsx`, client): fixed, height `--nav-h`; transparent until scrolled, then `--ground` at 0.86 alpha and
  a `--hairline-2` border. Links are mono 13px with a square marker that scales in; `aria-current` marks the section in
  view. The pill (CTA) shows only when scrolled. Mobile menu rows animate with `menu-rise`.
- **5.2 Pill** (`ui/pill.tsx`, `.pill`): 52px high (`.pill-sm` 44px), fully rounded, accent background, ink text, mono 550. A 40px ink icon disc rotates 45deg on hover; hover turns the pill paper with an accent glow.
- **5.3 Text link** (`ui/text-link.tsx`, `.tlink`): mono link, min height 44px, underline grows from scaleX .25 to 1 and
  an accent square appears (delay 300ms).
- **5.4 Section header and registration** (`ui/section-header.tsx`, `ui/reg-marks.tsx`): a registration row opens every
  section; `Corner` marks (offset -5px, `--dim`) frame panels; headings carry the square full stop and use
  `data-reveal="head"`; `h2` have `tabIndex={-1}` so the skip link and nav can focus them.
- **5.5 Microprint** (`ui/microprint.tsx`, `.microprint`): 6px strip, "malakmekyassi" drawn as an SVG background; no text in
  the DOM.
- **5.6 Grid overlay** (`ui/grid-overlay.tsx`): fixed 2-column (4 from 1024px) hairline columns at `--hairline-2`.
- **5.7 Photo** (`photo.tsx`): colour image plus a grayscale "daylight" copy above it with a lamp-shaped hole at the
  pointer (`--lx`, `--ly`, `--lr`; 110px on hover for fine pointers). On touch, the daylight layer fades out as the photo
  scrolls into view (`develop`). Always `loading="lazy"`; the class is always `photo`. Captions are numbered by CSS
  (`.fig-cap::before`, counter starts at Fig. 2; Fig. 1 is the hero caption).
- **5.8 Chapter** (`chapter.tsx`): year in the chapter ink, title, lede, a timeline with a spine that fills on scroll,
  and entries (school, role, community, hackathon). Built from `lib/story.ts` and `data/story.ts`.
- **5.9 Axon** (`axon.tsx`): the "now building" panel (§4.3): role line ("with {`venture.cofounder`}"), summary,
  tagline quote, principles, then a full-width partner strip above the CTA.
  - _Panel layout_ (v3.1, replaces the summary-only left column that left a tall void):
    - Header row (grid-12): eyebrow, title with AxonMark, role line and period in cols 1-7; the tagline blockquote
      (`t-display-m`) in cols 8-12, `lg:self-end`. Below lg the tagline stacks under the period.
    - Body row (mt-10): summary as `t-lead` in cols 1-5 (md: 6) beside the three principles, a 3-column row in cols
      6-12 at lg (each with its lime tick and hairline); one column beside the summary at md; stacked below md.
    - Rhythm: header→body mt-10, body→partners mt-10, partners→CTA mt-8 (was mt-12 throughout). Measured panel height:
      about 718px at 1440, 715px at 1280, 1201px at 390.
  - _Partner strip_ (data in `venture.logos`). Labels, names and links are copied verbatim from axonsecurity.tech's
    partner strip (retrieved 2026-10-29), marked `CONFIRM(malak)`. The "Backed by" group holds HackNation Venture Lab,
    AWS for Startups and E2B for Startups. The "Member of the cybersecurity program of" group holds the Anthropic Cyber
    Verification Program.
  - _Sources_:
    - E2B: `e2b.dev/brand` (logotype white-m).
    - HackNation: the white SVG from `hack-nation.ai/branding`.
    - Anthropic: the ivory wordmark from the official press kit.
    - AWS: no official SVG exists, so `aws-startups.png` (806×218) stays.

    Each SVG keeps only `<svg>`, `<title>` and `<path>`, with `fill="#fff"` and source path data unchanged (E2B keeps
    `evenodd`). `__tests__/data.test.ts` guards this.

  - _Layout_:
    - A hairline with a 24×2 px accent tick (the principles motif).
    - Groups at `lg:col-span-6` / `lg:col-start-7`, aligned with the principles column; they stack below lg.
    - Captions are `t-label text-faint` and double as each list's `aria-labelledby`.
    - Each logo is an `<a aria-label target=_blank rel="noopener noreferrer">` with a min height of 44px. The
      `<img alt="">` carries its intrinsic width/height (no CLS) and a CSS `height` set from `display`: HackNation 28,
      AWS 24, E2B 36 (its viewBox is about 50% padding, so the glyph renders at about 18px) and Anthropic 14 (v3.1; were 28/24/
      28/12). The heights balance optical weight, not box height. Known nit: E2B's artwork has about 8px of left
      side-bearing, so it sits slightly indented when it wraps to a line start at 390.
  - _Treatment_ (scoped to `[data-guest="axon"]`, the same rule axonsecurity.tech uses):
    - At rest: `filter: brightness(0) invert(.96); opacity: .7` (v3.1; was .55).
    - On hover or focus-visible: opacity 1, a `drop-shadow(0 0 14px rgb(var(--lime-rgb) / .45))` and a −2px lift. There
      is no lift under reduced motion.
    - In print: black.

- **5.10 Work, preface, toolkit, contact, footer**: Work is the project list; Preface the contents; Toolkit a text index
  (`.index-line`); Contact the closing pill and links; the footer has the lamp text button and the decorative MRZ line.
- **5.11 UV lamp hero field** (`hero-field.tsx`, client; `.hero-field`): a canvas behind the hero copy. Dashes in
  pitch 12px (8px below 768px), alpha range `0.07 + 0.18`, lit alpha `0.4`, UV pool alpha `0.075`. A portrait of
  Malak is hidden in the field's "low bits": in daylight it is invisible; under a lamp, UV halftone dots on their own
  fine grid (below) form her face, and the field dashes under her fade by matte coverage (`payloadMask`, x1.5, times
  the lamp strength) so dashes and dots do not fight. The portrait rect comes from `placePortrait` (4:5, right-aligned
  to the content edge, below the nav, clear of the hero text boxes; about 288x360 at 1440x900, bounded by the
  "Mekyassi." line). If no rect fits, the field falls back to the hidden "M." mark (`MARK_PATH`
  `M12 86 V16 L46 58 L80 16 V86` plus a 14px square, the same path as `ui/mark.tsx`; cells become UV squares, 3px core,
  7px halo at 0.18; placed by `placeMark`).
  - **Colour core.** The lens and the touch bloom cross-dissolve the dots into the real colour photo. The photo
    (`photos.portrait`, same-origin so the canvas stays untainted) loads when the effect mounts (`decode()`, `onload`
    fallback; no core if it never decodes) and is baked once per rebuild/DPR into a cutout canvas at `rect x dpr`:
    the photo, keyed by the upscaled 120x150 matte (`destination-in`; no `ctx.filter`, for Safari), with its bottom
    12% feathered out (the photo is cropped mid-torso). Each frame, per lamp with `core > 0`, the cutout is drawn
    through a radial mask into a reusable scratch canvas (it only grows) and composited `source-over` after the dots.
    Core radius `PORTRAIT.core = 0.7` x the lamp radius (105px for the 150px lens); the photo is fully opaque on a
    plateau to `coreFlat = 0.5` of that, then `coreAlpha` (a smoothstep) takes it to 0 at the edge. The dots inside use
    `1 - coreAlpha` of the same distance, so photo plus dots always sum to one: a true cross-dissolve, true colour at
    the centre. (v3 P2 first shipped 0.55 with a linear 1 / .92 at .45 / 0 ramp: the full-colour area was a ~37px disc
    and most of the visible core was the photo at 30-70% over the near-black field, which read dull and grey.)
  - Lamps (`core` per lamp): the pointer lens (radius 150px, 120 below 1280px; fine pointers only; core 1), the touch
    bloom (tap; radius `max(140, 0.45 x rect.h)` in portrait mode, 140 for the mark; grow 1400ms, hold 700ms, fade
    1200ms; core 1), and the hand-off bloom over the portrait once on load (radius 1.05 x the rect's half-diagonal). Without an
    opening it fires at 650ms with core 0 (pure halftone). With an opening it fires at `introClock(t0) + collapse`
    (the CSS clock, §6.1), or at once on a skip (`mm:intro-end`), with the colour core:
    `grow 0, hold collapseDur+100, fade 1000, core 1`, so the page already shows her photo as the overlay clears, then eases to halftone and the ghost.
    It reads the field when it fires, so a resize during the opening blooms on the rebuilt portrait.
  - States: in daylight the portrait rests as a faint ghost (`GHOST = 0.14`, v3.1 P2b), so a face silhouette is always
    discoverable in the field without competing with the name (the mark fallback stays hidden at 0); reduced motion
    draws one static frame with the halftone at 0.3 and no core (the mark at 0.45); lamp mode keeps the halftone at 0.6
    and the lens adds the colour core on top. The hero hint reads "Shine the lamp on the portrait." (fine pointer) /
    "Tap the portrait." (touch), `CONFIRM(malak)`. Inside a lamp disc a dot draws at
    `max(lamp, reveal) x (1 - core)`, so there is no ring at the disc edge.
  - Init: after `document.fonts.ready` (the copy boxes depend on Hubot's metrics), then an idle slot
    (`requestIdleCallback`, 800ms timeout; 200ms timer fallback). A 3s timer schedules init anyway if `fonts.ready`
    stalls. Init runs once; the photo may decode before or after it (the cutout is baked at whichever comes second).
    While an opening is playing, init runs in its own idle slot (`requestIdleCallback`, timeout `max(120, collapse - 700)`
    ms; a 60ms timer where it is missing), not inside the font callbacks, so it never shares a task with hydration or
    the overlay's prep. `draw()` skips a frame whose inputs (field/cutout version, lens, bloom lamp, lamp mode, reduced
    motion) equal the last one's, so the hand-off bloom's 700ms hold costs one draw, not 40. `portraitDots`,
    `matteCanvas` and `bakeCutout` are memoised in `lib/portrait.ts` (one entry each; the dots keyed by rect and pitch,
    the cutout by photo URL and pixel size), shared with the intro.
  - CSS: the field is masked (90deg ramp 22% to 58%, 180deg fade from 72%); below 768px it covers the top 52% with a
    70% vertical mask. Before the canvas is ready, a CSS dot texture (`radial-gradient`, 12px, 8px mobile: the field
    pitch) is shown; jsdom or no canvas keeps it. On scroll (root timeline, 0 to 70svh) the name compresses to
    `--wdth: 78` and the field dims to 0.35.
  - Canvas colours: dashes use `PAPER = rgb(239,237,245)` (see §2.4); the UV colour is read from `--uv-rgb` with
    `148,105,255` as fallback.
  - Dev only: `?debug=portrait` outlines the rect and draws the cutout at 35% (gated on `NODE_ENV`, absent from the
    production bundle).
  - **Shared modules.** `lib/hero-layout.ts`: `heroSize(wrap)` (w, h, mobile, rect; cheap, used for the no-op resize
    check) and `heroLayout(hero, wrap, size?)` (adds pitch, dpr, top, right, boxes), `textBoxes`, `fieldDpr`,
    `fieldPitch` (12px, 8 on mobile); used by `HeroField` and, later, the intro so their targets coincide.
    `lib/portrait.ts` (pure): `decodeTones`, `toneAt`, `matteAt`, `curve` (S-curve, floor 0.12 inside the matte, 0
    below L 0.08), `placePortrait` (4:5, right aligned, clear of the boxes, left edge at least 0.58w on desktop, floor
    0.72h desktop / 0.70h mobile, height capped at 1.5 x 625 / dpr, null if nothing fits), `squareSize`/`squareAlpha`,
    `drawCell`, `mulberry32`.
  - **Fine dot grid.** The portrait is not drawn on the field's dash cells (at 12px it is ~35 rows and reads as a
    silhouette). It has its own grid at `dotPitchFor(pitch) = pitch / 2`: 6px on desktop (a 360px portrait is 60 rows),
    4px on mobile at pitch 8 (a 240px portrait is 60 rows; 5px gave 48 rows and lost the eyes).
    `portraitDots(rect, dotPitch)` returns `{ x, y, tone }` Float32Arrays: dot centres snapped to `(k + 0.5) * dotPitch`
    in field coordinates (four dots per field cell), tone the mean of a 3x3 sub-sample, only dots above `payloadMin`
    (0.06), row-major. `payloadMask(rect, pitch, cols, rows)` gives each field cell's matte coverage (0..1), used to
    fade the dashes under the portrait when lit. Square side `min(dotPitch - 1, 0.6 + tone * dotPitch * 0.8)`, alpha
    `0.55 + 0.45 tone`; `drawCell` adds a `size + 2` halo at `0.12 * tone` (proportional to tone, so dark features stay
    dark instead of filling with glow).
  - **Tones.** `lib/portrait-tones.ts` is generated: a 120x150 grid, one byte per sample (high nibble luminance, low
    nibble matte), base64 (24.2 KB raw, 8.7 KB gzipped). The bake: greyscale, median 3, CLAHE (64px tiles, slope 4),
    resize, unsharp mask (sigma 2.5, m1 1.5, m2 3), percentile stretch inside the matte (2%..99.5%), gamma 0.85. Tuned by
    eye at the real display sizes; features are 1-3 dots tall, so the filters work at feature scale and the median
    removes skin texture that would read as dot noise. Regenerate with `pnpm portrait:tones` (needs `sharp`, output is
    byte-identical across runs); the matte is a hand-drawn polygon in `scripts/portrait-tones.mjs`; set `DEBUG_DIR` for a
    matte overlay and the enhanced greyscale. Commit the output.
- **5.12 Lamp toggle** (`lamp-toggle.tsx`, client): a nav/menu button (`.lamp-btn`, constant label "uv lamp", state in
  `aria-pressed`, 10px UV square) and a footer text button whose label states the action. State is announced through the
  `mm:lamp` window event.

## 6. Motion

Native CSS and one canvas loop; no animation library. Smooth scrolling is Lenis (`smooth-scroll.tsx`, `lib/lenis.ts`),
with `scroll-behavior: smooth` only when reduced motion is not requested.

### 6.1 Opening sequence

"Exposure" (v3.1 P3; `components/intro.tsx` server shell, `components/intro-stage.tsx` client canvas, `lib/intro.ts`,
CSS block "opening sequence" in `globals.css`). A darkroom exposure of her story. A fixed overlay (`z-index: 90`,
decorative, `aria-hidden`, nothing focusable, `pointer-events: none`) on `--ink`, with a mono top line ("mmalak.dev" /
"uv lamp · 365 nm", `CONFIRM(malak)`). Deliberately none of axonsecurity.tech's moves: no percentage counter, no boot
log or scramble text, no centre-line split, no logo draw-on.

Full sequence (ms from the CSS clock, timings in `INTRO.full`):

- **0-1750, year reel**: the chapter years from `data/story.ts` roll in a clipped slot (280ms each), each in its chapter
  ink with its title in mono (2022 "Foundation", 2024 "First build", 2025 "In production", 2026 "Ship under pressure"),
  then "now" in UV ("still developing"). The reel is one belt: each year rolls in (`intro-roll-in`, 0.92 x `reel` =
  258ms, `--ease-roll` `cubic-bezier(.65,0,.3,1)`, from 110% below) as the previous one rolls out (`intro-roll-out`, to
  -110%), both on the same soft in-out curve, so it never ticks (v3.1 P3b; it was an ease-out-expo pop and a hold per
  year). A canvas dash field drifts on a value-noise flow field. A fixed half of the dashes takes each year's ink over
  its paper stroke: every year's strength eases in over 150ms and out over 380ms (`tintAt`, `TINT_IN/OUT`), so
  neighbouring years cross-dissolve and the ink never switches or cuts. The reel is pure CSS (vars written from
  `INTRO`), so it plays before hydration; the canvas fades in over 280ms from its first drawn frame (`CANVAS_IN`), so a
  late hydration never pops the dashes in.
- **700-1750, converge**: dashes fade in over 120ms (`LAUNCH`) as they leave and fly on curved paths (bright tones first)
  to the portrait's dots from `heroPortrait()` (the same rect and dots as HeroField), on a quintic smootherstep
  (`easeFlight`: no violent first frame, a soft landing), and become UV squares (the dash shrinks on a smoothstep over
  140ms while its square grows), so her face develops. Registration corner marks frame the rect with the tag "subject
  · malak mekyassi".
- **1750-2150, exposure flash**: the real colour photo (matte-keyed cutout, preloaded) develops over the rect from the
  face outward: opacity ramps on a smoothstep over the first 85% of the flash while the mask opens on a cubic ease-out, under a
  UV glow that rises and falls; the moment her picture is unmistakable.
- **2150-2750, hand-off** (`collapseDur` 600): the ink background clears (`intro-clear`, 320ms, `--ease-soft`
  `cubic-bezier(.4,0,.2,1)`), the reel and top line
  fade (180ms, so the faded "now" never sits over the hero copy), the dashes, marks and tag fade over the first half,
  and the overlay photo crossfades (30-90% of `collapseDur`) into the page's own portrait in the same rect, which
  HeroField blooms in colour at the same instant (§5.11). A small UV square (`.intro-stop`) flies (`intro-fly`,
  `--ease-snap` `cubic-bezier(.5,0,.1,1)`: a gentle take-off, a long soft landing) from the end of "now" to the
  measured `.hero .full-stop` (`--i-stop-*`, `--i-from-*`, written at prep and re-measured 80ms before the hand-off; if `.full-stop` is missing it keeps its centre defaults and does not
  move). On landing the overlay hides (`intro-end`) and the hero's full stop takes over as a solid UV square
  (`intro-land`). The name fluoresces from UV to paper by colour only (`intro-fluoresce`, 900ms, `--ease-soft`); the h1's
  opacity is never animated (LCP). No clip-path shrink: it read as a black box over the name.
- Short variant (later views in the session, about 1.1s): no reel; the portrait develops in place, flash at 300ms
  (250ms), hand-off at 450ms (`collapseDur` 380, ink clear 220ms, top line 200ms); the square starts from the
  bottom-left corner; fluoresce 700ms; no reel and no ink tint. Timeouts: full 3100ms, short 1150ms from `t0`, about 350/320ms of slack after
  the hand-off; the overlay hides itself regardless, so the timeout only cleans up `data-intro`.

Smoothness (v3.1 P3b, measured on a production build in headless Chrome, rAF intervals and long tasks, 1440x900 and
390x844, unthrottled and with CDP 4x CPU; numbers in the changelog report). The CSS reel, the square's flight and the
overlay fades are transform/opacity animations, so they stay on the compositor while the main thread is busy; the
canvas and the hero are what a slow main thread drops. What was done about that:

- No setup in the animation's frames. IntroStage's prep yields to the main thread between its steps (layout reads and
  dots; particle set; cutout bake), HeroField's own init in an intro runs in an idle slot of its own (`requestIdleCallback`
  with a timeout of `max(120, collapse - 700)` ms, 60ms timer where it is missing), no longer inside the font callbacks
  next to hydration, and `portraitDots`, `matteCanvas` and `bakeCutout` are memoised (one entry each) so the intro and
  HeroField compute the dot grid, the matte and the cutout once between them.
- Cheaper frames. The overlay canvas density is capped at 1.5 (`DPR_CAP`; it only bites on 2x desktop screens; the cutout is
  baked at the hero's density, and at 2x no sharpness step is visible at the hand-off, since the 625px source carries no
  more detail than that: the rect is capped at 1.5 x 625 / dpr). Dashes are bucketed by alpha once (counting sort) and
  stroked in four paths; their segments are cached for the ink pass (no `Path2D`, no per-frame allocation). Dashes are
  skipped once the hand-off has faded them. The landed UV squares are drawn once into a rect-sized additive layer and
  blitted each frame (a `"lighter"` rect fill costs about 3x a source-over fill, and there are thousands of squares;
  only the squares still morphing are filled per frame). The flying dashes are stroked in four batches (three
  launch-fade buckets and the rest), never per dash.
- HeroField's `draw()` returns early when nothing it depends on changed (the hand-off bloom holds one image for about
  700ms, which used to be redrawn every frame).
- Not fixable here: JS evaluation and React hydration land at about 0-300ms (several 55-120ms tasks at 4x CPU, none
  at 1x); the reel and the fades keep playing through them because they are compositor animations.

One clock: the CSS animations start at the overlay's first style, a few frames after the boot script's
`__mmIntro.t0` (measured 30-110ms locally, longer on slow devices). The canvas and HeroField's bloom therefore run off
`introClock(t0)`, the overlay's CSS animation `startTime` (the document timeline shares `performance.now()`'s origin),
falling back to `t0` while the CSS is pending or where `getAnimations` is missing.

The inline boot script (`BOOT`, in `<head>` of `app/layout.tsx`) restores the lamp, then on `/` picks the mode: none (reduced
motion, `?intro=off`, deep-link hash other than `#top`, back/forward navigation, storage blocked), `full` (first view in
the session, `sessionStorage` key `mm-intro`) or `short` (later views). `?intro=full|short` forces a mode. Any key,
pointer, wheel or touch ends it at once (`window.__mmIntro.end`, idempotent); a timeout also ends it; it dispatches
`mm:intro-end`. On a skip the overlay hides at once, the canvas loop stops and frees its backing store, the name and
full stop are at rest, and HeroField blooms the colour photo immediately, settling to the ghost over about 1.7s.

### 6.2 Page motion

- Reveals (`data-reveal`, states set by `page-observers.tsx`): only elements below the viewport become `pending`, so
  nothing is hidden before JS. Rules scale in from the left (1100ms `--ease-io`); headings rise 0.35em over `--dur-3`
  and the full stop stamps (`stamp`: 0, 1.25, 1 over 380ms, delay 240ms).
- Scroll-driven extras are progressive enhancement under `@supports (animation-timeline: ...)`: hero name compress and
  field dim, chapter year stretch (`--wdth` 75 to 100), timeline spine fill, touch photo develop.
- Hover: `restamp` on the logo mark, pill icon rotation, link underline.

### 6.3 Reduced motion

`prefers-reduced-motion: reduce` collapses all animation and transition durations to 0.01ms and disables smooth scroll;
the opening overlay is `display: none`; the menu opens instantly; reveals are never set to pending; the daylight photo
layer is hidden; the hero field draws one static frame (the portrait halftone at 0.3, or the mark at 0.45) and runs no frame loop; the cursor caption is hidden.

### 6.4 Print

Pending reveals are forced visible (`opacity: 1`, `transform: none`), and the intro overlay and the daylight photo
layer are hidden.

## 7. Accessibility

- Skip link `.skip` (fixed, accent background) targets `#main`; section headings are focusable (`tabIndex={-1}`).
- Focus ring: `2px solid var(--accent)`, offset 3px, on `:focus-visible`; selection is accent on ink.
- Text contrast (code-comment values; recomputed in §4.2): `--ghost` 6.55:1, `--faint` 4.58:1 is the minimum for text;
  `--dim` (2.06:1) is for decoration only.
- Touch targets: nav links, text links and the lamp button are at least 44px high; footer links 32px from 1024px.
- Decorative layers (`.hero-field`, intro, grid overlay, microprint, MRZ, registration marks) are `aria-hidden` and
  `pointer-events: none`. The page underneath the intro is fully rendered.
- The hero renders no portrait `<img>`; the hero field is canvas-only. Photos in chapters carry alt text on the colour
  layer; the grayscale copy has `alt=""`.
- The lamp toggle uses `aria-pressed` with a constant name; the footer button changes its text instead.
- Reduced motion, print and no-JS fall back as in §6; the page works without the canvas (CSS dot texture).
- `color-scheme: dark`, `lang="en"`, JSON-LD `Person` in the layout.

## 8. OG and icons

- **OG and Twitter image** (`lib/og.tsx`, via `app/opengraph-image.tsx` and `app/twitter-image.tsx`): ink `#0b0a0f` ground
  (legacy, §2.4), four faint column lines (`rgba(239,237,245,0.07)`, starting at x=72, step 264), a 600px dash field on
  the right (pitch 14) with the M revealed as UV squares, a fade into the ink (240px), the role line in Newsreader italic
  34px, the name in Hubot 800 at 150px (line 0.84, tracking -0.045em) with a 24px UV square, the Axon tagline at 26px
  (`rgba(239,237,245,0.64)`) and a microprint strip. Text comes from `data/portfolio.ts`; fonts are fetched as static
  Google instances and fall back to the default font offline. Role text carries `CONFIRM(malak)`.
- **Favicon** (`app/icon.svg`): 128px rounded square (rx 28) in `#0b0a0f` with the M in `#efedf5` and a `#9469ff` square.
- **Apple icon** (`app/apple-icon.tsx`): 180x180 `#0b0a0f` square (no radius; iOS masks it) with the 120px M.
- **Theme colour** (`data/site.ts`): `#0b0a0f`.
- **Global error** (`app/global-error.tsx`): inline styles only (no CSS available), `#0b0a0f`/`#efedf5` and a `#9469ff` full stop.

## 9. Content and copy rules

- Education name: **Arts & Métiers Casablanca**. Never use the abbreviation (it is blocked by `__tests__/guard.test.ts`).
- Capgemini Engineering: "AI Product System & PLM Intern", **Jul – Aug 2026**, always past tense, never "current".
- Role title: "Co-founder & co-CEO", Axon Security, with Hany El Atlassi.
- Curation: wins, roles and major projects only. No certificates, talks, workshops or events; the guard test blocks a list
  of removed items.
- Unverified copy carries a `CONFIRM(malak)` comment next to it (for example the hero lead, chapter ledes, OG text, control
  labels). Do not remove a marker until she confirms the wording.
- No loading UI: no `loading.tsx`, no ">LOADING<", no `next/dynamic` (guard test).
- Data sources and confirmation tags live in `data/portfolio.ts` comments (`[U]` confirmed by Malak, `[V]` verified,
  `[LI]` LinkedIn).
- Research paper (v3.1, [U] 2026-10-29): "Spectral Weight Topology Analysis for Execution-Free Integrity Verification
  of Serialized Machine Learning Models", accepted at the 10th IET International Smart Cities Symposium (venue verified
  on iet-smartcities-symposium.com: 1-3 December 2026, e-Learning Center, University of Bahrain). No acceptance date or
  publisher is claimed. Shown on SXR (badge "Paper accepted — 10th IET Smart Cities Symposium", the page's own short
  form, plus `Project.paper` in italic voice; the SXR link is `CONFIRM(malak)`, inferred from the topic) and in the
  Education detail.
- Capgemini highlights are Malak's own wording, verbatim (two bullets: the Li-ion EV battery SOH pipeline; the ICA/DVA
  feature extraction targeting ONNX export for BMS deployment).
- Projects: PlagAi removed (v3.1); five projects, three from the chapter-4 hackathons (Aegis, JarvisLfla7, MediCore).
  Both Mentee entries (Dell STEM Aspire, McKinsey Forward) stay, in the 2025 chapter.
- Voice: terse, factual, first-person in the lead; serif italic for asides (unverified: a style intent, not enforced
  by code).

## 10. Changelog

- **2026-10-29 v3.1 responsive QA (320-1920, touch and desktop).**
  - Axon header row spans `md:col-span-6` at md (at 768 the title and tagline had auto-placed into 1/6 columns).
  - `.chapter-to` drops below the year under 380px (at 320 "2022 to 2023" overflowed the viewport by 24px).
  - The hero hint is hidden when no portrait fits (`.hero-field[data-mode]`, set by HeroField; short phones such as
    360x780 fall back to the mark).
  - `.lamp-btn` and the menu hints never wrap; below 430px the "Now: Axon" hint drops "since" so the label stays on one
    line.

- **2026-10-29 v3.1 P3b: opening smoothness.** The reel became one belt on a soft in-out curve (110% travel, 0.92 x
  `reel`); year inks cross-dissolve (`tintAt`) instead of switching; the canvas fades in from its first frame; flying
  dashes fade in and ease in and out (`easeFlight`); the exposure develops on smooth ramps; the clear, flight and name
  colour use `--ease-soft` / `--ease-snap` (`--ease-soft` and `--ease-roll` added to `:root`, §2.2). Start-up work is yielded or moved to idle, shared (memoised dots, matte,
  cutout), and the canvas got cheaper (DPR cap 1.5, landed-squares layer, bucketed strokes, no per-frame allocations,
  skipped identical hero frames). INTRO timings unchanged (full about 2.9s, short about 1.1s). Details in §6.1, §5.11.

- **2026-10-29 v3.1 P3: opening "Exposure" and the resting portrait ghost.**
  - Replaces the torch pass: year reel in chapter inks, dashes converge into her halftone portrait, colour exposure
    flash, then a hand-off (ink clears, overlay photo crossfades into HeroField's colour bloom, a UV square flies to
    the hero full stop). No clip-path box over the name. Details in §6.1.
  - Shared CSS clock (`introClock`); INTRO full collapseDur 600 / timeout 3100, short 380 / 1150; reel fade 180ms.
  - Resting ghost at 0.14 in daylight and hint copy "Shine the lamp on the portrait." / "Tap the portrait." (§5.11).
  - Old torch/fibre intro code, keyframes, off-token colours and `--ease-sweep` removed.

- **2026-10-29 v3.1 P5a: content and Axon panel.**
  - Accepted IET Smart Cities paper on SXR and in Education; Malak's Capgemini highlights; PlagAi removed (§9).
  - Axon panel re-laid out: header row with the tagline, principles as a 3-column row beside the summary, tighter
    rhythm; partner logos at optically balanced heights (32/28/36/14) and 0.7 rest opacity (§5.9).

- **2026-10-29 v3 P2: the hero hides a halftone portrait with a colour lamp core.**
  - The portrait replaces the M (kept as the fallback when no 4:5 rect fits): UV halftone dots on a grid at half the
    field pitch, bucketed per field cell (CSR) so lamps visit only the dots in reach; dashes under her fade by matte
    coverage.
  - The lens and the touch bloom cross-dissolve into the colour photo (matte-keyed cutout, baked per rebuild/DPR);
    the intro hand-off bloom stays pure halftone. Reduced motion: static halftone at 0.3; lamp mode: 0.6.
  - Mobile field pitch 10 to 8 (4px dots), mobile mask 55% to 70%, CSS fallback dots 10px to 8px.
  - Validator tuning: core 0.55 to 0.7 of the lamp radius with a full-colour plateau (`coreFlat` 0.5) and one shared
    smoothstep (`coreAlpha`) for photo and dots, so the face (eyes to mouth) shows in true colour; the cutout's bottom
    edge is feathered; dot reach padded by one dot pitch; init no longer waits forever on a stalled `fonts.ready`.
    Details in §5.11.

- **2026-10-29 v3 P4: Axon partner strip.**
  - Official sanitised SVGs (E2B, HackNation, Anthropic wordmark) replace the invisible `currentColor` glyph and the
    navy-on-dark PNGs; AWS keeps its PNG.
  - The strip is now a full-width, labelled grid row with links, `aria-label`s and 44px targets.
  - Logos get a mono treatment with a lime glow on hover, scoped to Axon.
  - `next/image` (and its wrong-aspect `width={200}` CLS) is dropped for plain `<img>` with intrinsic sizes.
  - `venture.cofounder` is extracted.
  - Partner-logo use is `CONFIRM(malak)`. Details in §5.9.

- **2026-10-29 v3 P1: shared portrait and hero-layout modules (no visual change).**
  Added `lib/portrait.ts`, `lib/hero-layout.ts`, generated `lib/portrait-tones.ts` and `scripts/portrait-tones.mjs`
  (`pnpm portrait:tones`, `sharp` dev dependency); moved `mulberry32` to `lib/portrait.ts`; `HeroField` now measures
  through `heroSize`/`heroLayout` (still the M; copy boxes are only measured after the no-op size check); ESLint knows
  the Node globals for `scripts/*.mjs`. The portrait gets its own fine dot grid (`portraitDots` at half the field pitch,
  `payloadMask` for P2) over a 120x150 tone grid baked with median, CLAHE, unsharp mask and gamma, so the face (eyes,
  brows, nose, lips, hairline, collar) reads at 60 rows. Details in §5.11.

- **2026-10-29 v3 P0: repo cleanup, DESIGN.md reconstructed, folded .opencode elevation plan.**
  Removed 19 committed root screenshots, untracked `.DS_Store` and `next-env.d.ts`, ignored `/*.png` and `.opencode/`;
  deleted dead code (a null-returning IIFE in `chapter.tsx`, `interface Program`, unused `Photo` props, `.axon-link`,
  `--dur-4`, the `.hero-photo*` rules, the unused `hackai-grey-matter.jpg`); un-exported `setLamp`/`useLamp`; renamed a
  misleading hero test; repointed dangling doc comments here.
  Folded plan: the earlier `.opencode` elevation plan (a "field notes / lab notebook" metaphor; one primary accent used
  sparingly; mono for metadata and strong display type; tighter hierarchy and tracking; more editorial asymmetry; a
  more print-like photo treatment; subtler micro-interactions; native CSS such as scroll-driven animation; no copying of
  axonsecurity.tech or gitslender.dev; no unverified claims; respect reduced motion, print and a11y). Its still-relevant
  direction is restraint and a tighter hero; its palette-reduction idea was superseded by the per-chapter ink system
  (§4.1), and the portrait and new intro are tracked as v3 P2 and P3.
