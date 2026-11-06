# Perimystic — website design handover

This branch transforms the original `theogportfolio` Next.js experience into the **Perimystic** creative marketing agency site using the visual references supplied on 6 November 2026.

## Creative direction

- **Visual language:** hand-painted Indian truck-art and retro street-sign lettering, decorative borders, saturated poster colours, playful Hindi/English phrasing.
- **Palette:** saffron yellow `#FFD333`, cobalt `#1646B5`, chilli red `#F03934`, pink `#FF57A8`, turquoise `#24B9AC`, warm cream `#FFF2C3`.
- **What stays:** original GSAP/ScrollTrigger, Lenis, WebGL, animated preloader, horizontal work slider, video case studies, reduced-motion behaviour, core responsive structure.
- **New original artwork:** `public/assets/ornaments/truck-art-strip.svg`, `public/icon.svg`. Reference Pinterest imagery is not copied into the site.

## Files to edit

- `src/components/PerimysticExperience.tsx`: interactive site content, section composition, custom cursor, scrolling and intro.
- `src/app/globals.css`: existing CSS and final Perimystic design-skin overrides.
- `src/lib/content.ts`: brand and founder-experience projects, plus three flagship offers.
- `src/lib/logo.ts`: canvas-drawn text mark used by particle intro.
- `src/webgl/Scene.tsx`: WebGL logo and effects.
- `src/app/layout.tsx`: SEO, metadata and icon.
- `src/app/opengraph-image.tsx`: social share artwork.

## Important accuracy and launch tasks

1. **Founder examples are not Perimystic clients.** The work section explicitly credits the founder's previous roles and freelance experience. Confirm the exact ownership, licensed media and performance claims before going live.
2. **Verify Instagram handle** in `src/lib/content.ts`; `@perimystic` is a provisional contact target and must be checked before launch.
3. **Set an official business email** and then implement verified lead handling. This branch intentionally removed the old studio's phone numbers, locations, old Instagram feed ID, and an unused legacy contact API route.
4. If using a Google Apps Script contact form, create a Perimystic-specific endpoint, set `NEXT_PUBLIC_PERIMYSTIC_SHEET_FORM_URL` on Vercel, and test end-to-end. Without it, the CTA links to the Instagram target. Existing client-side no-cors submission cannot verify server acceptance, so use a verified form handler before launch.
5. If using the latest Instagram post module, set `NEXT_PUBLIC_PERIMYSTIC_BEHOLD_FEED_ID`. Never reuse the previous studio's feed ID.
6. Set `NEXT_PUBLIC_SITE_URL` to the final Perimystic domain after deployment.
7. Validate on 375px, 768px, 1440px and reduced-motion; run `npm run lint`, `npx tsc --noEmit`, `npm run build`.
8. The old local ambient audio filename and historical media files are preserved for now to avoid breaking existing interactions. Replace or remove assets as appropriate after verifying usage and rights.

## Tech

Next.js 16, React 19, TypeScript, GSAP, Lenis, React Three Fiber, Three.js.

## Deployment

The original `main` branch is untouched. This design lives on `perimystic/desi-maximalist-rebrand`. Create/inspect a preview build before merging into `main`; do not deploy to production without reviewing claims and validating contact links.
