# Perimystic — working branch handover (6 November 2026)

## Repository state

- Repo: `PxTOF/theogportfolio`
- Branch: `perimystic/desi-maximalist-rebrand`
- Review: draft pull request #1. **Do not merge to `main` without approval.**
- Vercel branch deployment is connected; GitHub Actions checks lint, TypeScript and build.
- Founder work belongs to earlier employers/freelance engagements, **not** Perimystic clients.

## Work applied in this iteration

1. Replaced the old 3.2-second, black-screen starfield and mandatory click-to-enter with a parchment signboard intro. Automatic ~1.75-second play plus ~0.42-second reveal; skip button and keyboard support; session-only once; reduced-motion bypass; scroll lock released.
2. Reworked site palette around parchment (`#f0dfba`), terracotta (`#a64021`), dark forest teal (`#193f33`) and muted brass. Rebalanced hero, sections, projects, contact and footer.
3. Removed fake Impact/canvas/WebGL wordmark and GPU-heavy logo particle simulation. Ambient WebGL is retained only as subtle background; phones skip heavier effects.
4. Added shared `LogoMark` image slot. When `NEXT_PUBLIC_PERIMYSTIC_LOGO_SRC` is set to a valid supplied image (ideally `/assets/branding/perimystic-logo.png`), the **actual official logo** replaces the temporary *plain typographic label* in preloader, hero and footer. The temporary label is **not** claimed as the original logo.
5. Scoped GSAP animations and ScrollTrigger teardown; removed DOM-mutating SplitType wrappers and uncleaned attention hover listeners. Horizontal card scroll now recalculates overflow on ScrollTrigger refresh.
6. Disabled an unverified Instagram URL rather than sending visitors to an account that may not belong to the agency. Contact CTAs are only activated when official social details or a working form are configured.
7. Updated temporary editorial favicon, Open Graph card and browser theme to the heritage palette. Replace the favicon with the approved monogram once supplied.

## Inputs needed from the owner

- **Original standalone Perimystic logo image** (the square vintage signboard image attached in the prior ChatGPT conversation). Prefer PNG at full resolution; do not regenerate or trace its typography. Add to `public/assets/branding/perimystic-logo.png` and configure `NEXT_PUBLIC_PERIMYSTIC_LOGO_SRC=/assets/branding/perimystic-logo.png` in Vercel. Crop/transparent variants only after inspecting the real source.
- **Verified official Instagram handle/link** and business email. Once confirmed, configure `NEXT_PUBLIC_PERIMYSTIC_INSTAGRAM_URL` and `NEXT_PUBLIC_PERIMYSTIC_INSTAGRAM_LABEL`; add official email and tested lead handling.
- Final domain (configure `NEXT_PUBLIC_SITE_URL`) and approval of founder-work/media rights.

## Tests and acceptance

The existing GitHub Actions workflow runs `npm run lint`, `npx tsc --noEmit` and `npm run build` on each push. A successful Vercel build is necessary but **not a visual browser test**.

Still require a live desktop/mobile run at 375px / 768px / 1440px and with reduced motion. Check browser console/network; intro startup and auto-exit; keyboard skip; repeat visit; GSAP pin transitions; Lenis smooth scrolling; horizontal cards on resize; video posters and playback; WebGL loss/fallback; contact link, form submission and responsive clipping. Capture screenshots and iterate before merging.

## Brand/business constraints

Core offers: Social & Content; Creator Campaigns; Brand Launches. Do not carry over Snag phone numbers, mailboxes, addresses or social-feed IDs. Previous work (SuperProfile, Burger Bae, Depano, Body Juices, Barber Syndicate) remains explicitly founder experience.

Do not turn on the Google Apps Script form without a tested Perimystic-only endpoint (`NEXT_PUBLIC_PERIMYSTIC_SHEET_FORM_URL`). The old no-cors client-side submission could not prove successful delivery. Verify any feed integration through `NEXT_PUBLIC_PERIMYSTIC_BEHOLD_FEED_ID` before activation.
