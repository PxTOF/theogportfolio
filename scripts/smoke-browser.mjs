import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const output = "browser-screenshots";
await mkdir(output, { recursive: true });

const viewports = [
  { name: "desktop-1440", width: 1440, height: 900, reducedMotion: "no-preference" },
  { name: "tablet-768", width: 768, height: 1024, reducedMotion: "no-preference" },
  { name: "mobile-375", width: 375, height: 812, reducedMotion: "no-preference" },
  { name: "mobile-reduced-motion", width: 375, height: 812, reducedMotion: "reduce" },
];

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const problems = [];

try {
  for (const test of viewports) {
    const context = await browser.newContext({
      viewport: { width: test.width, height: test.height },
      reducedMotion: test.reducedMotion,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    try {
      const response = await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 });
      assert.equal(response?.status(), 200, `Homepage should return HTTP 200: ${test.name}`);
      await page.waitForSelector(".cinematic-hero", { timeout: 10000 });
      await page.waitForFunction(() => document.querySelector(".preloader") === null, null, { timeout: 9000 });
      // The desktop intro copy has a short GSAP reveal; snapshot settled UI.
      await page.waitForTimeout(test.width > 900 ? 900 : 150);

      assert.equal(await page.locator(".cinematic-slide").count(), 3, "All three showcase films should exist");
      assert.equal(await page.locator(".cinematic-slide h1").count(), 1, "Hero should have exactly one H1");
      assert.match(await page.title(), /Perimystic/i);
      assert.equal(await page.locator('a[href="mailto:pushkarsvashisht@gmail.com"]').count() >= 1, true);
      assert.equal(await page.locator('a[href="tel:+919729317565"]').count() >= 1, true);
      assert.equal(await page.locator('a[href="https://www.instagram.com/perimystic/"]').count() >= 1, true);

      const image = await page.locator(".brand-artwork-image").first().getAttribute("src");
      assert.match(image || "", /perimystic-logo\.webp/, "Real owner-provided artwork should be used");
      const logoResponse = await page.request.head(`${base}/assets/branding/perimystic-logo.webp`);
      assert.equal(logoResponse.status(), 200, "Original logo must be served");
      for (const file of ["work/pinned-1.mp4", "media/burger-bae.mp4", "media/peribest.mp4"]) {
        const mediaResponse = await page.request.head(`${base}/assets/${file}`);
        assert.equal(mediaResponse.status(), 200, `Missing video: ${file}`);
      }

      const extent = await page.evaluate(() => ({
        window: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      assert.ok(extent.scrollWidth <= extent.window + 3, `Horizontal overflow: ${JSON.stringify(extent)}`);
      const heroFit = await page.locator('.cinematic-slide[data-idx="0"]').evaluate((root) => {
        const heading = root.querySelector("h1");
        const cta = root.querySelector(".cinematic-primary-cta");
        const foot = root.querySelector(".cinematic-slide-foot");
        if (!heading || !cta || !foot) return null;
        const h = heading.getBoundingClientRect();
        const c = cta.getBoundingClientRect();
        const f = foot.getBoundingClientRect();
        return { headingTop: h.top, headingBottom: h.bottom, ctaBottom: c.bottom, footTop: f.top,
          headingOpacity: Number(getComputedStyle(heading).opacity) };
      });
      assert.ok(heroFit, "Opening hero elements should be present");
      assert.ok(heroFit.headingTop > 85, `Hero heading must clear the nav: ${JSON.stringify(heroFit)}`);
      assert.ok(heroFit.ctaBottom < heroFit.footTop - 7, `Hero CTA must not overlap the film credits: ${JSON.stringify(heroFit)}`);
      assert.ok(heroFit.headingOpacity > .9, `Hero text must be visible after the intro: ${JSON.stringify(heroFit)}`);

      if (test.width <= 900) {
        const inertSlides = await page.locator(".cinematic-slide[inert]").count();
        assert.equal(inertSlides, 0, "Stacked mobile slides must remain keyboard-accessible");
      } else {
        assert.equal(await page.locator(".cinematic-slide[inert]").count(), 2, "Hidden desktop slides should be inert");
      }

      await page.screenshot({
        path: `${output}/${test.name}.png`,
        fullPage: false,
        animations: "disabled",
      });

      if (test.name === "desktop-1440") {
        await page.mouse.wheel(0, test.height * 2.2);
        await page.waitForTimeout(1200);
        const idx = await page.locator('.cinematic-slide[data-active="true"]').getAttribute("data-idx");
        assert.notEqual(idx, "0", "Pinned hero should advance to a new video when scrolled");
        await page.screenshot({ path: `${output}/desktop-1440-second-slide.png`, fullPage: false });
      }

      if (errors.length) throw new Error(`Browser JS errors: ${errors.join("; ")}`);
      console.log(`✓ ${test.name}: intro, original logo, media, links, layout, keyboard state`);
    } catch (error) {
      const message = `${test.name}: ${error.stack || error}`;
      problems.push(message);
      console.error(message);
      await page.screenshot({ path: `${output}/${test.name}-failed.png` }).catch(() => {});
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
if (problems.length) process.exitCode = 1;
