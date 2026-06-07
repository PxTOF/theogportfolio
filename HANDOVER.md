# SNAG — Portfolio site · Handover

A single-page, space-themed portfolio for **SNAG** (studio.snag), a creative & content
studio in Gurgaon/Ranchi. Dark cosmos aesthetic, **red / black / white only**, heavy on
motion (WebGL nebula, GSAP scroll, particle preloader).

> ⚠️ **Read this first:** `AGENTS.md` — this is a newer Next.js than your training data.
> Before writing Next-specific code, read the relevant guide in `node_modules/next/dist/docs/`
> and heed deprecation notices.

---

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict)
- **GSAP + ScrollTrigger** (pinned/scrubbed scroll), **Lenis** (smooth scroll)
- **React Three Fiber / three / drei / postprocessing** — hero nebula + bloom
- Fonts: Bebas Neue (display), Syne (body), DM Mono (mono) via `next/font`

## Run it

```bash
npm run dev     # http://localhost:3000   (preferred: use the preview server / launch.json)
npm run build   # production build
npx tsc --noEmit && npx eslint .   # the two gates — keep both clean
```

`.claude/launch.json` defines a `snag-portfolio` server on port 3000. The dev server is
ESLint-clean and type-clean; keep it that way.

## Project structure

```
src/
  app/
    layout.tsx            metadata, fonts, viewport
    page.tsx              renders <SnagExperience/>
    globals.css           ALL styling (design tokens + every component)
    opengraph-image.tsx   generated OG card (next/og)
    api/contact/route.ts  ⚠️ UNUSED legacy resend/zod endpoint (see Cleanup)
  components/
    SnagExperience.tsx    the whole experience (client). Preloader, Hero, AttentionModel,
                          ProofSlides (3 pinned reels), WorkShowcase/ProjectCard,
                          WhatWeDoMarquee, OpenWeightProof (+ LatestReel, ContactForm),
                          Contact, footer, Cursor, Constellation, AudioToggle, WebGLBoundary.
  lib/
    content.ts            brand + projects[] + services[]  ← edit copy/cards here
    logo.ts               drawSnagLogo() — used by preloader + WebGL hero particles
  webgl/
    Scene.tsx, HeroBackground.tsx, Effects.tsx, store.ts, track.ts
public/assets/
    work/                 work-card + pinned reels (clean slugs)
    media/                older/brand reels (incl. red-radisson, beautyr-marketplace)
    posters/ logos/ gallery/ hero/ models/
```

## Content model (`src/lib/content.ts`)

- **`brand`** — name, logo, email, instagram, `phone` (Gurgaon), `phone2` (Ranchi),
  `location` (Gurgaon), `location2` (Ranchi).
- **`projects[]`** — the work cards (13). Card numbering is **derived from array order**
  in `WorkShowcase` (no `index` field on the data). Fields: `id, title, category, status,
  headline, description, outcomeLabel, outcome, video?, poster?, gallery?, tags`.
- **`services[]`** — drives the "What we do" service grid (`title`, `text`, `icon`).

## Environment (`.env.local`, git-ignored — NOT in the repo)

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_BEHOLD_FEED_ID` | Behold.so feed for the auto-updating "Latest on Instagram" card. Currently `bDimAptWlG8fo0gknVwk`. |
| `NEXT_PUBLIC_SHEET_FORM_URL` | Google Apps Script `/exec` URL the contact form posts to (see below). |

**Restart the dev server after changing env** (Next inlines `NEXT_PUBLIC_*` at startup).

## "Latest on Instagram" card (`LatestReel`)

Client-fetches `https://feeds.behold.so/<FEED_ID>` on load, renders **`posts[0]`** (the
true latest post — image or video) in a 3D-tilt card. For images it uses Behold's stable
proxied URL (`sizes.full`), not the expiring IG CDN link. Falls back to a local reel if the
env var is unset / fetch fails. We render our own UI — not Behold's widget.

## Contact form → Google Sheet (`ContactForm`)

The form POSTs `name, contact, message` (form-encoded, `mode:"no-cors"` fire-and-forget,
optimistic success) to a Google Apps Script web app that appends a row to a Sheet.

**Setup:**
1. New Google Sheet → **Extensions → Apps Script** → paste the code below → Save.
2. **Deploy → New deployment → Web app** · Execute as **Me** · Who has access **Anyone** → copy the `/exec` URL.
3. `.env.local`: `NEXT_PUBLIC_SHEET_FORM_URL=<that /exec url>` → restart dev.

```js
// Code.gs — SNAG contact form → "Leads" sheet
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(5000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
    if (sheet.getLastRow() === 0) sheet.appendRow(['Timestamp', 'Name', 'Contact', 'Message']);
    var p = (e && e.parameter) || {};
    sheet.appendRow([new Date(), p.name || '', p.contact || '', p.message || '']);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

## Design system (in `globals.css`)

- Tokens in `:root`: `--white #f2f2f2`, `--black #050505`, `--red #e8271e`, `--red-dark`,
  `--red-glow`, `--reel-grade` (shared video filter). **Palette is hard red/black/white.**
- Global layers: `.cosmos` (drifting stars + nebula + constellation), WebGL nebula
  (hero only), `.cinema` (vignette + lens bloom + light-leak), `.grain` (animated film grain).
- Reduced-motion: a global `@media (prefers-reduced-motion: reduce)` freezes animations.

## Known cleanup / TODO

- **Compress `public/assets/media/beautyr-marketplace.mp4` (~163 MB!)** — far too heavy for an
  autoplaying card; target < ~8 MB H.264.
- **Unused assets (~136 MB)** safe to delete: `media/{depano.mov,depano.mp4,depano-model.mp4,
  superprofile.mp4,snag-eye-signal.mp4,baecave.mp4,baecave-radisson.mp4}`, both `models/*.glb`,
  unused `logos/*`, `posters/snag-source-page.jpg`, and `hero/snag-media-desk.png` (old hero
  photo, removed from code). `gallery/` is no longer referenced either.
- **`src/app/api/contact/route.ts`** — legacy resend/zod endpoint, nothing calls it. Remove it
  (and the `resend`/`zod` deps) now that contact uses the Google Sheet form.
- **Ambient audio**: `AudioToggle` expects `public/assets/audio/ambient.mp3` (no-ops until added).
- Barber Syndicate has no dedicated logo/poster; uses `beautyr-marketplace.mp4`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
