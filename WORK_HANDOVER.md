# PERIMYSTIC — EXECUTION HANDOVER FOR CHATGPT WORK
**Prepared:** 6 November 2026  
**Priority:** Finish the website; do not spend time on agency strategy, a separate portfolio, or new mockups.

## 0. Your role and the requested outcome

Act as the hands-on developer, visual designer and QA engineer for **Perimystic**, a newly launched founder-led marketing agency. Work in the actual GitHub codebase and connected browser. Fix the site, not just describe how to fix it.

The owner specifically said:
- The earlier **SNAG** portfolio website should be rebranded to **Perimystic**; reuse as much of its existing architecture and useful interactions as possible.
- The reference moodboard is Indian truck-art / Indian vernacular graphic design, with vintage hand-painted signboards and ornament.
- The owner's **actual Perimystic logo** is a more restrained vintage ivory, rust-red, deep green/teal, and ochre signboard graphic. It is the canonical identity, not a substitute text logo.
- The previous assistant's first design had a wrong/missing preloader and animation problems. Work must visually inspect and fix them, even if automated tests pass.
- The result must be a **real, functional, responsive website with a preview URL**, not only a design concept.

## 1. Source of truth

- **GitHub repository:** https://github.com/PxTOF/theogportfolio
- **Development branch:** `perimystic/desi-maximalist-rebrand`
- **Draft pull request:** https://github.com/PxTOF/theogportfolio/pull/1
- **Latest Vercel branch preview (may update with commits):** https://bestone-git-perimystic-096dce-sharmapushkar2003-3749s-projects.vercel.app
- **GitHub handover in repo:** `HANDOVER.md` — read it before changing anything.
- **Original site:** https://theogportfolio.vercel.app/
- **User's original logo assets are already in the branch:**
  - `public/assets/branding/perimystic-logo.webp`
  - `public/assets/branding/perimystic-crest.webp`
- **Original inspiration screenshots** are in the earlier ChatGPT conversation; ask for reattachment only if they are inaccessible and necessary. Do not copy third-party Pinterest images directly into the site.

**Safety:** Work only on the development branch. Preserve the source site's `main` branch. Do not merge or publish to production without explicit owner approval.

## 2. Current implementation status (checked on 6 Nov)

The current branch has **already evolved beyond the initial draft**. Do not assume the early text-only Perimystic logo remains. As recorded in the current `HANDOVER.md`:
- The **real supplied full logo** and its cropped crest have been integrated.
- The homepage hero uses a **three-film showcase** with founder-experience examples; desktop uses an editorial split and mobile native stacked films.
- The preloader currently reveals the actual logo on a parchment backdrop, with auto-exit, skip on repeat, and reduced-motion handling.
- Previous Snag contact details and feed have been replaced, with agency contact information provided in `HANDOVER.md`.
- The old particle-text logo has been removed and WebGL is ambient-only.
- GSAP timeline scoping/cleanup and keyboard focus on hidden slides have received changes.
- CI includes TypeScript, ESLint, production build and Playwright browser smoke tests at 1440/768/375px and reduced-motion.
- **Latest checked Vercel deployment: success. Latest checked GitHub Actions job: success (including browser smoke tests).** These are not proof that every animation looks correct.

**Do not reset these improvements.** Start by pulling and reading the current branch, `HANDOVER.md`, current component and screenshot artifacts.

## 3. Brand direction: reconcile reference moodboard with actual identity

**Actual logo:** vintage cream-textured rectangular signboard; tall distressed rust-red `Perimystic` lettering; a black P/forward-arrow emblem and ornamental arch; teal/dark green `MARKETING AGENCY` plaque, delicate rust and gold lines/flourishes; Hindi `रणनीति` and `परिणाम`; phrase `INSIGHT · STRATEGY · IMPACT`.

Use:
- Ivory / parchment as the main surface.
- Rust red / terracotta as hero accents and the wordmark's dominant colour.
- Deep teal / forest green for plaque/navigation/footer details.
- Muted brass / ochre for lines and ornament.
- Controlled bursts of brighter truck-art tones only where useful. Do not make it a chaotic neon carnival.
- Editorial typography for body copy and authentic hand-painted/signboard influence for display.
- Intentional negative space, subtle paper texture, borders and small folk-art details. Avoid generic clipart, fake Indian fonts, and clutter.

The original logo must be used accurately, uncropped and legible wherever the full logo appears. Use the crest for small places. If image transparency is required, preserve its details and do not regenerate an inaccurate logo.

## 4. Critical task A: preloader polish

Inspect and repair the actual current preloader rather than assuming it is unfinished.
- Show parchment texture immediately; no black flash / blank frame.
- Elegant stamped/printed reveal of the **original real logo**, preferably with subtle decorative line drawing, masking or ink-wipe, not flashy unrelated star particles.
- Motion should be premium and restrained; total first-time load approximately 1.5–2.5 seconds if assets are ready.
- Provide an accessible skip control; repeat visits in a session should not replay the intro unnecessarily.
- Honor `prefers-reduced-motion`.
- No scroll-lock left behind; no hero jump, duplicate logo, clipped wordmark, delayed content interaction, loading overlay covering clickable elements, or layout shift.
- Confirm desktop and narrow mobile portrait presentation.

## 5. Critical task B: visual/browser animation QA and fixes

The owner reported animation errors; the exact failure conditions are **not yet reliably diagnosed**, so reproduce them on the live branch preview and in a local browser rather than guessing.

Inspect console errors, exceptions, network asset failures, performance and resulting UI state. Specifically check:
1. GSAP ScrollTrigger pin/scrub: first film hero to next sections, pinned slide transitions, nav updates, and all section entrances.
2. Lenis smoother: normal wheel/trackpad and touch scroll, cleanup, browser back navigation and anchor jumps.
3. Video playback: muted/autoplay/loop, only active films playing, no stutter/freeze/overlap, poster fallback.
4. Horizontal portfolio rail: distance calculations, drag/scroll and full accessibility on desktop and mobile.
5. Preloader lifecycle: first and repeat visit, skip, reduced motion, slow network, scroll restore.
6. WebGL/Canvas: no black screens, no intercepting pointer events, sensible CPU/GPU load, fallback if context fails.
7. Contact CTA + external Instagram/email/phone links, actual form submission behaviour where enabled.
8. Layout clipping, typography and contrast at **375px, 768px and 1440px**, Safari and Chromium if available.
9. Focus order, keyboard controls, invisible slides not tabbable, accessible reduced motion.

Do not destroy working animation systems just to paper over issues. Prefer small, tested, justified fixes. If a cinematic effect is intrinsically unreliable on mobile, simplify **only the mobile fallback**.

## 6. Site content and business requirements

Perimystic is a **creative marketing agency** with three flagship offers:
- **Social & Content:** content strategy, reels/carousels, creative direction, calendars and reporting.
- **Creator Campaigns:** influencer/UGC research, sourcing, briefing, coordination, negotiations and reporting.
- **Brand Launches:** positioning, creative concepts, campaign strategy and launch execution.

Past work showcased from **SuperProfile, Burger Bae, Depano, Body Juices and Barber Syndicate** is the founder's previous employment/freelance work. It MUST be clearly attributed as **founder experience**, and not described as clients who hired Perimystic. Do not invent metrics or agency case studies.

The owner-confirmed public contact details are already recorded in `HANDOVER.md`. Do not reuse Snag contact addresses or feed identifiers. Only activate a live public form with a tested Perimystic-specific destination. Confirm final domain before changing metadata.

## 7. Relevant file map

- `src/components/PerimysticExperience.tsx` — full client-facing page, preloader, hero, animations, case-study slides and contact.
- `src/app/globals.css` — global style and the design overrides.
- `src/lib/content.ts` — agency brand content, prior founder projects and services.
- `src/lib/logo.ts`, `src/webgl/Scene.tsx` — legacy canvas/WebGL integration; inspect for any leftover incorrect logo treatment.
- `src/app/layout.tsx` and `src/app/opengraph-image.tsx` — metadata/social cards.
- `public/assets/branding/perimystic-logo.webp` and `perimystic-crest.webp` — authoritative logo imagery.
- `.github/workflows/perimystic-site.yml` — CI/browser tests.
- `HANDOVER.md` — latest technical status and verified contacts.

The stack is Next.js 16, React 19, TypeScript, GSAP/ScrollTrigger, Lenis, Three/React Three Fiber. Observe repository `AGENTS.md` instructions concerning Next.js version and local framework documentation.

## 8. Execution instructions — do not respond with a plan only

1. Open the GitHub branch and read `HANDOVER.md` and code. Inspect attached visual references and logo.
2. Open Vercel's branch preview in the **Work browser** and inspect the actual preloader, desktop hero, mobile and animation sequences; capture screenshots. You can use browser/computer control available in Work.
3. Compare current visual result against the actual logo and moodboard; prioritise visual faithfulness and avoid wholesale redesign without need.
4. Diagnose and fix runtime animation problems. Run the site locally if browser tooling supports it; otherwise use branch preview + source inspection.
5. Commit fixes incrementally on `perimystic/desi-maximalist-rebrand`; keep PR #1 updated.
6. Re-run TypeScript, ESLint, build and browser smoke tests, and manually inspect screenshots and browser console.
7. Deliver **preview URL, screenshots (desktop/mobile), what changed, what was fixed, and any remaining blockers**.
8. Ask the owner to review visual changes. **DO NOT MERGE** or switch the production site without their explicit sign-off.

## 9. Acceptance criteria

- The real logo is immediately recognisable and consistent across preloader, hero, favicon and footer.
- A cohesive vintage India-inspired aesthetic, faithful to the approved original logo, not an unrelated neon interpretation.
- No visible preloader glitches, black flashes, scroll locking, major clipping or animation crashes.
- Desktop and mobile feel intentionally designed, not merely shrunk.
- Links/CTAs function and all public claims are properly attributed.
- Automated checks green AND visual browser review complete.
- Original production branch untouched until owner approval.

**Output: a working, visually polished Perimystic website. Start from the existing repo and make changes, rather than asking for a new brief or offering instructions without doing the work.**
