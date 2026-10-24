# Malak Portfolio Elevation Plan (Gru + Minions)

Goal: Sharper, more distinctive portfolio without copying axonsecurity.tech or thegitslender.dev. Inspired by researched sites but uniquely "Malak".

## Research Summary

From exploration:

- Current: forensic/dossier aesthetic with UV lamp, intro sequence, scroll-driven animations, strong type system. Distinctive already.
- Inspired by: rauno.me/shud.in (restraint), muntasirmasum.com (data-forward), haoqi.design (interface framing), paco.me (mature), gitslender.dev (tight type/positioning).

Key patterns to borrow (without copy):

- Single strong accent, used sparingly
- Monospace for metadata/UI, strong display/sans
- "Show don't tell" - link to code/demos, explain
- Native CSS (scroll-driven, view transitions) where possible
- Tight hierarchy, generous whitespace

## Design Direction

**Metaphor:** "Field notes / lab notebook" - technical but human. Think engineering notebook margins, ruled lines, terse labels, precise measurements. Keep the UV/security DNA but refine it.

**Palette refinement:**

- Keep ink/surface structure but shift accents: choose ONE primary accent (maybe a crisper cyan or keep UV but desaturate others) for cleaner hierarchy
- Add subtle warmth in text? Or keep cool. Test contrast.
- Lamp mode more intentional

**Typography:**

- Tighten tracking on labels
- More deliberate scale jumps
- Maybe introduce subtle tabular nums everywhere for data

**Layout/interaction:**

- More editorial asymmetry (some elements break grid intentionally)
- Tighter hero composition
- Photo treatment more print-like (less "day/night reveal" gimmick, more considered)
- Micro-interactions more subtle

## Proposed Changes

### Phase 1: Palette & Tokens (app/globals.css)

- [ ] Refine color tokens - pick cohesive accent set, reduce neon overload
- [ ] Tighten type scale/clamps
- [ ] Improve spacing rhythm
- [ ] Subtle texture adjustments

### Phase 2: Hero & Identity (components/hero.tsx, hero-field.tsx)

- [ ] More editorial composition - tighter hierarchy
- [ ] Cleaner role/links presentation
- [ ] Refined photo frame
- [ ] Subtler field animation

### Phase 3: Content Structure (data/_, components/_)

- [ ] Sharper copy - more terse, more distinctive
- [ ] Better work presentation (show impact/tech clearly)
- [ ] Tidy preface/contents
- [ ] Refine chapter entries

### Phase 4: Details & Polish

- [ ] Nav refinement
- [ ] Photo treatment
- [ ] Animations more restrained
- [ ] Micro-details

## Constraints

- Don't copy axonsecurity.tech or gitslender.dev
- No unverified claims
- Keep tests passing
- Respect reduced motion/print/a11y
- Keep existing data integrity

## Execution Method: Gru reviews Minions

1. Minion 1: Deep dive into globals.css + tokens
2. Minion 2: Analyze hero/components for improvement ideas
3. Minion 3: Research specific micro-interactions to adapt
4. Gru (main agent): Review all findings, draft unified plan, critique, refine
5. Implement in controlled batches with tests

Start with read-only research.
