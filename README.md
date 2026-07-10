# The Farm Stories — Land, well told.

A luxury storytelling website for **The Farm Stories**: not a farmland listing site,
but a living storybook where people discover farms the way they discover beautiful novels.
Story One is **Mango Meadows** — a boutique managed mango orchard community in the
Nilgiris foothills at Agali (26 families, 30-year-old trees, documentation first).

## Pages

| Route | Page |
|---|---|
| `/` | Home — intro book (3D page turns), ink-to-orchard hero morph with lazy video, trust strip, The Beginning teaser, Three.js miniature orchard, bookshelf teaser, Write Your Chapter form |
| `/about` | About us — the founding story, house rules, three pillars, quote |
| `/projects` | Our Projects — the bookshelf; Story One opens a flipbook reader with 7 turning pages; the **plot explorer** (26 plots: hover, select, sticky detail panel, compare up to 3, bookmarks, zoom/pan/pinch, filters for status/size/budget/character); My Farm Journal preview + owner notify form |
| `/portal` | The Portal — the project **aggregator**: sidebar filters (project / location / status), a South-India map with one pin per estate and click-to-read tooltips, and listing cards that stay in step with the filters (Mango Meadows, Coffee Canopy, Areca Vale, Pepper Hollow, Lantern Lake) |
| `/community` | The Community — "Another chapter is being written." + Notify me |
| `/agritech` | Agri-tech — "The instruments are being planted." + Notify me |
| `/whats-new` | What's New — ticker, dispatches, gatherings with one-tap RSVP, newsletter |

## Stack

Static site — no build step. Deploys as-is on **Vercel** (`vercel.json` has `cleanUrls`,
so `/about` serves `about.html`).

- Lenis (smooth scroll) + GSAP ScrollTrigger — vendored locally in `js/vendor/`
- Three.js — lazy-loaded only when the orchard section approaches (home only)
- Hero video lazy-attaches its source on first scroll and hides itself on error
- All below-the-fold images use `loading="lazy" decoding="async"`
- `prefers-reduced-motion` respected everywhere
- Exactly one ScrollTrigger site-wide (the home hero pin); everything else is
  IntersectionObserver or rAF-throttled scroll math
- Hero video: WebM first (drop `assets/hero.webm`, ≤8 MB) with MP4 fallback,
  lazy-attached on first scroll; slow Ken Burns drift via CSS
- Unsplash imagery served with `auto=format` (AVIF/WebP negotiation) and
  explicit dimensions on the hero to avoid CLS
- Three.js scene uses `powerPreference: low-power`, pauses off-screen, and
  disposes geometry/materials on `pagehide`

## Files

```
index.html          home (intro book · hero morph · 3D orchard · shelf · contact)
about.html          about us
projects.html       our projects + flipbook reader + farm journal
portal.html         the portal (multi-project atlas + filters)
community.html      coming soon + notify
agritech.html       coming soon + notify
whats-new.html      news, gatherings, newsletter
css/main.css        the whole design system (paper, ink, gold seal)
js/main.js          shared behaviour — every block guards for its own markup
js/orchard.js       the Three.js miniature (loaded on demand)
js/vendor/          gsap · ScrollTrigger · lenis · three (self-hosted)
assets/logo.png     brand mark
```

## Local preview

```
npx serve .
```

## Notes

- Content hierarchy follows the D-IPS strategic report: operational trust before
  lifestyle aspiration, existing orchards over promises, boutique scale, no ROI talk.
- If you have real Mango Meadows photography/drone footage, swap the Unsplash/Pexels
  URLs in `index.html` and `js/main.js` — highest-impact upgrade available.
