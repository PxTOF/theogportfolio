# Perimystic — live redesign handover

Status: **draft PR #1** on `perimystic/desi-maximalist-rebrand` in `PxTOF/theogportfolio`.
Do not merge to `main` without the owner's approval.

## Approved brand inputs received 6 Nov 2026

The original provided vintage agency logo is now committed as a real image rather than recreated through CSS or generated text:

- `public/assets/branding/perimystic-logo.webp` — faithful full 1080×1080 logo from the user upload, WebP converted for responsive delivery.
- `public/assets/branding/perimystic-crest.webp` — cropped **original** P-arrow monogram, for small-scale navigation and browser icon.
- No AI redraw, fake Impact wordmark or canvas-generated logo is used.
- Visual palette: parchment, terracotta, forest-teal, muted brass. Original copy retains Hindi `रणनीति` / `परिणाम`.

The owner confirmed public enquiries should use:
- Instagram: `https://www.instagram.com/perimystic/`
- Temporary contact email: `pushkarsvashisht@gmail.com` (not yet a dedicated agency inbox)
- Phone: `+91 97293 17565` (call link: `tel:+919729317565`)
- Service area: **Chandigarh and Delhi NCR**

## Page structure and visual changes

1. **Hero is now the three-film showcase** previously found in the third section. The old static hero component is removed. Desktop shows a deep-teal editorial split-screen reel canvas with vintage navigation, actual P crest, expressive headline, editorial copy, CTA and film progress. Mobile switches to three native vertically stacked video sections with readable scrims.
2. The three films show **selected founder work before Perimystic** (Depano, Burger Bae, SuperProfile). Their attribution is displayed on every slide and on the work section. These are **not** mislabelled as Perimystic client contracts.
3. Preloader auto-reveals the actual owner logo on parchment after a brief 1.75-second intro (+ 0.42-second fade), with skip button, per-session skip on repeat, and reduced-motion support.
4. Authentic crest is the favicon; the original artwork reappears in the footer. Contact CTA opens the provided email, with direct phone and Instagram links and local availability.
5. WebGL remains ambient-only; the old incorrect particle text logo is removed. GSAP now scopes/reverts its animations; hidden pinned slides are inert so invisible links don't steal keyboard focus; videos pause when no longer active.
6. Existing capabilities remain Social & Content, Creator Campaigns and Brand Launches.

## Automated testing

`.github/workflows/perimystic-site.yml` runs:
- TypeScript (`npx tsc --noEmit`)
- ESLint (`npm run lint`)
- Production build (`npm run build`)
- Playwright Chromium smoke tests at 1440px, 768px and 375px plus reduced-motion.
- Captures browser screenshots as a workflow artifact named `perimystic-browser-screenshots` for review.

The smoke tests check intro auto-exit, one H1, video and logo HTTP availability, responsive overflow, social/mail/tel links, pinned slide change, and hidden-slide keyboard focus.

## Before merging

Review the latest Vercel draft deployment and browser screenshots for frame accuracy, legibility, visual clipping, media rights, mobile playback and GSAP pinning. Confirm final domain in `NEXT_PUBLIC_SITE_URL`; replace personal email with future official agency inbox when provisioned. Do not activate an untested public lead form.

**Never merge without owner approval.**
