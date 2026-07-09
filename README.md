# The Farm Stories — Land, well told.

A luxury storytelling website for **The Farm Stories**: not a farmland listing site,
but a living storybook where people discover farms the way they discover beautiful novels.
Story One is **Mango Meadows** — a boutique managed mango orchard community in the
Nilgiris foothills at Agali (26 families, 30-year-old trees, documentation first).

## Experience map

| Chapter | What it is |
|---|---|
| The book opens | Intro: a hardbound tome in darkness; click/tap/swipe turns real 3-D pages, then dissolves into the site |
| Hero | A hand-drawn ink panorama that morphs, layer by layer, into the real orchard (photo + lazy video) as you scroll |
| The Beginning | The founding story and the verification standard (trust-first, per the DIPS report) |
| Stories | A shelf of hardbound books; Mango Meadows opens into a **flipbook reader** with 7 realistic turning pages (Introduction · Location · Gallery · Masterplan · Ownership · Amenities · Reserve) |
| The Orchard | A lazy-loaded **Three.js miniature diorama** — terrain, instanced mango trees, stream, lake, pavilion, birds — with a scroll-driven camera and dawn-to-noon light |
| The Library | Interactive **plot explorer**: 26 plots, zoom/pan/pinch, hover pages, filters (status/size/character), compare up to 3, bookmarks (localStorage), sun-path and terrain lenses |
| Gatherings | Community events with one-tap RSVP |
| My Farm Journal | The owner's record as a journal — timeline, monthly report, harvest, papers |
| Coming chapters | Community & Agri-tech as elegant "Another chapter is being written" pages |
| Write Your Chapter | CRO-focused visit form + WhatsApp/call, sticky mobile CTA, trust assurances |

## Stack

Static site — no build step. Deploys as-is on **Vercel** (see `vercel.json`).

- Lenis (smooth scroll) + GSAP ScrollTrigger — via CDN, feature-detected
- Three.js — lazy-loaded only when the orchard chapter approaches
- Vanilla CSS/JS otherwise; Fraunces + Karla from Google Fonts
- `prefers-reduced-motion` respected everywhere (intro, morph, particles, 3D idle)

## Files

```
index.html        markup, all chapters
css/main.css      the whole design system (paper, ink, gold seal)
js/main.js        intro book · hero morph · flipbook · plot explorer · journal · ambient leaves
js/orchard.js     the Three.js miniature (loaded on demand)
assets/logo.png   brand mark
```

## Local preview

```
npx serve .
```

## Notes

- Hero video is a progressive enhancement: it lazy-attaches its source on first
  scroll and hides itself on error, falling back to the photograph.
- Content hierarchy follows the D-IPS strategic report: operational trust before
  lifestyle aspiration, existing orchards over promises, boutique scale, no ROI talk.
