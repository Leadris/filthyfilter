# FilthyFilter by whispAir — Project Context

## Current handoff — 2026-09-05

**Read `docs/REDESIGN_PLAN.md` first.** It is the approved implementation brief, checklist and live handoff for Codex/Claude; see also `CLAUDE.md`. It supersedes historical decisions below. User instructions take precedence.

- Keep the existing dark copper/gold HUD visual design and humor. Brand: **FilthyFilter by whispAir**; do not use Klimuj.sk or Dutch business details.
- Main market: Slovakia. Senec and surroundings, up to approximately 100 km; availability and travel costs by address.
- Phone/WhatsApp: +421 902 279 094. Email: info@filthyfilter.sk (delivery still unverified).
- Slovak source HTML and default language. **The site ships SK and EN only**; the Dutch layer was removed on 2026-09-05. Keep the remembered manual selection; both languages describe the same Slovak service area.
- Static HTML/CSS/JS. Shared contact destinations are in `CONTACT` in `js/main.js`, with functional matching HTML fallback links.
- The legacy `steden/` directory was deleted on 2026-09-05. It held old filthyfilter.nl URLs that never existed on the new domain. La Donuteria remains a case study. Collaboration section is deferred.
- Baseline tag: `baseline-v1` on `99b956c85f6c857475340ad7be76914f7d24f003`. Work branch: `codex/filthyfilter-redesign`.
- Production is `https://filthyfilter.sk/`, the root of its own domain on the same WebHouse account. Branch pushes do not deploy. See `docs/DEPLOYMENT.md` for the release process and the outstanding TLS certificate.
- Stages 1 and 2 are done: branding, the reordered content, service cards, proof section, FAQ, business section and the audio simplification. The full inquiry form with validation is still open. Check the plan before continuing.

## Historical baseline context

The original notes below explain the site's history, not current brand/market/language policy. The baseline tag preserves the complete original implementation.

> Purpose of this file: a self-contained brief so the project context can be
> recovered later (by a human or an AI assistant) straight from the repo,
> without the original chat history. Read this first.

## What this is
A playful marketing **website for an air-conditioning cleaning business**,
**FilthyFilter.nl**. Mock-scientific / sci-fi "HUD data-sheet" branding (a
"Fungus Detection Division", a signature **FFFF Rating™** = *FilthyFilter Fungus
Fun Factor*, scale `FFFF 0 Factory Fresh` → `FFFF 5 Contact Scientists`).

Visual style: near-black background, copper/gold/bronze metallic accents,
angular framed panels with corner brackets, faint grid, chunky metallic display
title, monospace "technical" labels.

## Repo layout (this repo == the site)
This repository **is** the static site — its root is what you deploy.

```
index.html               # homepage (all sections)
css/styles.css           # full HUD design system + layout + responsive + animations
js/main.js               # language toggle (NL/EN/SK) + one-shot section fade-in + mobile nav
js/background.js          # WebGL background (spores + mycelium) + parallax
assets/favicon.svg
steden/                  # local-SEO city landing pages (clean URLs /steden/<city>/)
  index.html             #   hub "Werkgebieden"
  eindhoven/ tilburg/ breda/ den-bosch/ maastricht/   (index.html each)
sitemap.xml  robots.txt
README.md                # Dutch end-user / deploy notes
CONTEXT.md               # this file
```

> Note: this folder previously sat inside a separate, **unrelated** WordPress
> Docker dev environment (a parent `whispAir.sk/` folder with `docker-compose.yml`
> = MySQL + WordPress + phpMyAdmin, and a bulky `wp-content/`). That WordPress
> stack is NOT part of this repo and the static site does not use it. The repo was
> deliberately scoped to **only this `filthyfilter/` folder**.

## Key decisions (the "why")
- **Static HTML/CSS/JS. No framework, no backend, no build step, no WordPress.**
  Deploy = upload the contents of this repo to any static host (.nl hosting,
  Netlify, Cloudflare Pages). Only external dependency: Google Fonts.
- **Trilingual NL / EN / SK.** Default **NL** (it's a .nl business). Language is a
  client-side toggle: translatable nodes carry `data-nl` / `data-en` / `data-sk`;
  `js/main.js` swaps `textContent` + `<html lang>` + active button, persists in
  `localStorage` key `ff_lang`. Per-page `<title>`/meta come from an inline
  `window.FF_META = { nl:{title,desc}, en:{...}, sk:{...} }` block (so the toggle
  doesn't clobber per-city titles); `applyLang()` falls back to homepage META.
- **Contact = details only** (phone / e-mail / WhatsApp via `tel:` / `mailto:` /
  `https://wa.me/`). No form, no backend.

## Homepage sections (index.html)
Nav · Hero (metallic FILTHYFILTER title + pointer parallax) · Overview/"At a glance" ·
**FFFF Rating™** (0–5 scale) · Services ("Decontamination Protocols") ·
Process (Inspectie→Detectie→Decontaminatie→Certificering) · Why us + Quick-profile strip ·
**Hall of Filth** · Contact · Footer (with links to the city pages).

## Animated background — `js/background.js` (raw WebGL1, no deps)
One fullscreen fixed canvas `#spore-field` renders BOTH layers:
- **Spores**: GPU point sprites, additive glow, drift upward; parallax via `uPointer`
  (mouse) and `uScroll` (scroll) in the vertex shader. Sprite diameter is stored in
  CSS px (`CFG.sporeSizeMin/Max` ≈ 4.8–20.8, matching the original 2D version's
  `r 0.6–2.6 × 4` glow radius) and the shader multiplies by `u_dpr` exactly once.
- **Mycelium**: branch geometry generated once on CPU, revealed by a `uProgress`
  uniform (grow→hold→fade→regrow loop), pinned to the live `.hero` rect.
- Animates on mobile too (GPU-budgeted: fewer points, clamped DPR, FPS cap).
  Respects `prefers-reduced-motion` (single static frame). Handles context-loss.
  **2D fallback** draws a static spore frame if WebGL is unavailable.
- Tunables in the `CFG` object at the top of the file.
- NOTE: an earlier 2D-canvas version caused mobile scroll-freeze; fixed by removing
  `background-attachment: fixed` and moving to GPU/WebGL.

## Section entrance — `initReveal()` in `js/main.js`
**One-shot fade + slide-up per section, via IntersectionObserver.** Every
`.wrap.reveal` container starts at `opacity:0; translateY(18px)` (CSS in the
`REVEAL ANIMATION` block of `styles.css`); when it scrolls into view (threshold
0.12) the script adds `.in`, which transitions it to `opacity:1; transform:none`
over .6s, then unobserves it. No scroll-linked motion, no per-child stagger.
- No IntersectionObserver → all `.reveal` elements get `.in` immediately (visible).
- Respects `prefers-reduced-motion` (CSS forces `.reveal` visible, no transition).
- HISTORY: a scroll-LINKED variant (`initScrollReveal()` + `.ff-js-reveal` gate,
  mapping opacity/translateY to viewport position, per-layer parallax + stagger)
  existed briefly; reverted to this simpler one-shot fade on request. Before that,
  a CSS `animation-timeline: view()` version — dropped for patchy browser support.

## City SEO pages — `steden/`
5 real target cities in the south of NL (Brabant/Limburg): **Eindhoven, Tilburg,
Breda, ’s-Hertogenbosch (den-bosch), Maastricht** + a hub `steden/index.html`.
Each page: unique content (local intro, neighborhoods, 2 local FAQ), own
`<title>`/canonical/OpenGraph, `window.FF_META`, and **`HVACBusiness` JSON-LD**
with `areaServed` + geo. Reuses the shared CSS/JS via `../../` paths.
- Deliberately **NOT doorway pages** (each has genuinely unique content) — that
  avoids Google's spam penalty.
- SEO note: the language toggle is JS on one URL, so Google indexes the **default
  NL** text per URL. EN/SK are user-facing only, not separately indexed. To index
  EN/SK you'd need separate URLs per language + `hreflang` (not done).
- Adding a city: copy a `steden/<city>/index.html`, edit content/JSON-LD/FF_META,
  then add the URL to `sitemap.xml`, the hub, and the homepage footer links.

## Hall of Filth (homepage section `#hall`)
A gallery of "worst filters found", styled as an AI-classified specimen archive.
5 categories with FFFF badges + funny "AI verdict" + fake confidence %:
**Dust Monster, Fungus Kingdom, Nicotine Edition, Kitchen Grease Boss, Pet
Apocalypse**, plus a 6th "submit via WhatsApp" CTA card.
- Architecture chosen: **static gallery, no backend.** Technicians submit photos
  via WhatsApp/e-mail; classification is **conversational** (the assistant tags a
  submitted photo, writes the verdict/FFFF score, and replaces the placeholder
  with a real `<img>`). Each specimen image is currently a styled placeholder
  with a `TODO` comment + `.specimen__img` box; drop real photos into
  `assets/hall/` and swap the placeholder for `<img>`.
- Cards use the `.specimen` component; the section container is `.wrap.reveal` so
  it fades in with every other section. Category labels are intentionally English
  brand terms (not translated).

## ⚠️ Placeholders still to fill (search `TODO` across the repo)
- Phone number (`tel:`), WhatsApp number (`wa.me/…`, country code, no `+`/spaces),
  e-mail (`mailto:`) — currently `+31 6 00 00 00 00`, `31600000000`,
  `info@filthyfilter.nl`.
- KvK / BTW in footers (`00000000` / `NL000000000B00`).
- Real domain in `canonical` / OpenGraph / JSON-LD (assumed `https://filthyfilter.nl`).
- Real photos for Hall of Filth + (optional) real prices, logo, reviews.

## Known gotchas / ops
- **Browser cache**: CSS/JS filenames are unversioned, so returning visitors can
  see stale files after an update. Tell them to hard-refresh (Ctrl+Shift+R), or add
  a `?v=N` query to the `<link>`/`<script>` refs across the 7 pages (not yet done).
- **Preview/verification**: the dev preview tool was frequently flaky in this
  project (reported `window.innerWidth: 0`, broken `scrollTo`, occasional
  screenshot timeouts). Computed-style checks were used to verify when screenshots
  failed. On a real browser everything renders/scrolls normally.

## Run / preview locally
```
# from the repo root
python -m http.server 8090
# open http://localhost:8090  and  http://localhost:8090/steden/
```

## Git
This repo is scoped to the FilthyFilter static site only (the `filthyfilter/`
folder). No remote configured yet — add one with `git remote add origin <url>`
then `git push -u origin main` when ready.
