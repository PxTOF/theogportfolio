"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";
import { ArrowRight, AtSign, Mail, MapPin, MessageCircle, Pause, Phone, Play, Volume2, VolumeX } from "lucide-react";
import { brand, projects, services, type Project } from "@/lib/content";
import { drawSnagLogo } from "@/lib/logo";
import { useScrollStore } from "@/webgl/store";

gsap.registerPlugin(ScrollTrigger);

const Scene = dynamic(() => import("@/webgl/Scene"), { ssr: false });

const proofStats = [
  ["Creators activated", "500+", "A paid creator network built to move clean — not just rack up vanity reach."],
  ["Daily revenue", "10×", "Burger Bae went ₹30K → ₹3L a day on content built to convert, not just look cute."],
  ["Organic posts", "360+", "One Radisson creator night, engineered to keep circulating long after last call."],
];
type ProofSlide = {
  eyebrow: string; title: string; copy: string;
  media: string; poster?: string; metric: string; value: string;
};
// Three full-screen pinned showcase reels. Media points at clean slugs in
// /assets/work/ — drop the renamed files there (see rename map). Copy is lean
// placeholder; the bold/quirky rewrite happens in the text pass.
const proofSlides: ProofSlide[] = [
  {
    eyebrow: "Reel 01 — Depano",
    title: "Fixing what was stuck.",
    copy: "A brand with no real traction, reworked into sharp positioning and content that converts.",
    media: "/assets/work/pinned-1.mp4",
    poster: "/assets/posters/depano.png",
    metric: "Focus",
    value: "Sales intent",
  },
  {
    eyebrow: "Reel 02 — In the wild",
    title: "Made to be scrolled twice.",
    copy: "Content built to stop the thumb first, then earn the share.",
    media: "/assets/work/pinned-2.mp4",
    metric: "Built for",
    value: "The share",
  },
  {
    eyebrow: "Reel 03 — Attention, engineered",
    title: "We don't chase reach. We build it.",
    copy: "Systems that turn one-off posts into brand memory.",
    media: "/assets/work/pinned-3.mp4",
    metric: "Output",
    value: "Momentum",
  },
];

function LogoMark({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return <Image src={brand.logo} alt="SNAG logo" width={815} height={524} priority={priority} className={className} />;
}

// A failed/lost WebGL context (or postprocessing init) must never white-screen
// the whole page — fall back to the CSS cosmos + content if the 3D layer throws.
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: unknown) { console.warn("[SNAG] WebGL layer disabled:", err); }
  render() { return this.state.failed ? null : this.props.children; }
}

// ─── New Preloader: star-particles converge into SNAG, tap/Enter to dismiss ──

function Preloader({ onDone }: { onDone: () => void }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase]       = useState<"forming" | "ready" | "exiting">("forming");
  const [visible, setVisible]   = useState(true);
  const phaseRef = useRef<"forming" | "ready" | "exiting">("forming");

  useEffect(() => {
    // Don't let the browser restore a previous scroll position behind the
    // preloader — the site must always reveal at the hero (top).
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    let cancelled = false;
    let raf = 0;

    const run = async () => {
      // Wait for fonts (with timeout so we never block indefinitely)
      await Promise.race([
        document.fonts.ready,
        new Promise<void>((res) => setTimeout(res, 600)),
      ]);
      if (cancelled) return;

      const canvas = canvasRef.current;
      const ctx    = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      // Dimensions can resolve to 0 very early in mount; never let them be 0 or
      // getImageData() throws an IndexSizeError and the loader hangs on black.
      const rect = canvas.parentElement?.getBoundingClientRect();
      const W = (canvas.width  = Math.max(1, Math.round(rect?.width  || window.innerWidth  || window.screen?.width  || 1280)));
      const H = (canvas.height = Math.max(1, Math.round(rect?.height || window.innerHeight || window.screen?.height || 720)));

      // ── Sample pixel positions of the real Snag wordmark ───────────────────
      const LOGO_CY = 0.42; // vertical centre of the logo (shared with the glow)
      const off    = document.createElement("canvas");
      off.width = W; off.height = H;
      const oct    = off.getContext("2d")!;
      drawSnagLogo(oct, W, H, { widthFrac: W > H ? 0.42 : 0.78, cy: LOGO_CY, color: "#ffffff" });

      const imgData = oct.getImageData(0, 0, W, H);
      const pixels: [number, number][] = [];
      const step = Math.max(2, Math.floor(W / 230));
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          if (imgData.data[(y * W + x) * 4 + 3] > 90) pixels.push([x, y]);
        }
      }
      pixels.sort(() => Math.random() - 0.5);

      const N = Math.min(1100, pixels.length);
      type Pt = { x: number; y: number; tx: number; ty: number; r: number; spd: number; isRed: boolean };
      const pts: Pt[] = [];
      for (let i = 0; i < N; i++) {
        // Start above or below the screen for a dramatic fly-in
        const fromTop = Math.random() < 0.5;
        pts.push({
          x: Math.random() * W,
          y: fromTop ? -Math.random() * H * 0.4 : H + Math.random() * H * 0.4,
          tx: pixels[i]?.[0] ?? W / 2,
          ty: pixels[i]?.[1] ?? H / 2,
          r:  Math.random() * 1.8 + 0.85,
          spd: 0.016 + Math.random() * 0.028,
          isRed: Math.random() < 0.09,
        });
      }

      // Background star field (static + twinkle)
      type Star = { x: number; y: number; r: number; ph: number };
      const stars: Star[] = Array.from({ length: 320 }, () => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        r:  Math.random() * 1.0 + 0.12,
        ph: Math.random() * Math.PI * 2,
      }));

      const TOTAL = 3.2; // seconds to form
      let startTs = 0;
      let t = 0;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      const draw = (now: number) => {
        if (cancelled) return;
        if (!startTs) startTs = now;
        t = (now - startTs) / 1000; // real elapsed seconds — frame-rate independent
        const prog = Math.min(1, t / TOTAL);
        setProgress(Math.round(prog * 100));

        // Trail fade instead of full clear for comet effect
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, W, H);

        // Background stars
        for (const s of stars) {
          const a = 0.12 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.7 + s.ph));
          ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Particles converging into SNAG
        const ease = Math.min(1, prog * 1.4);
        ctx.shadowBlur = 0;

        for (const p of pts) {
          p.x += (p.tx - p.x) * p.spd * ease;
          p.y += (p.ty - p.y) * p.spd * ease;

          const alpha = 0.18 + ease * 0.82;

          if (p.isRed) {
            ctx.shadowBlur   = prog > 0.4 ? 12 : 0;
            ctx.shadowColor  = "rgba(232,39,30,1)";
            ctx.fillStyle    = `rgba(232,39,30,${alpha.toFixed(3)})`;
          } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle  = `rgba(242,242,242,${alpha.toFixed(3)})`;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Red nebula glow forms behind the wordmark as it assembles
        if (prog > 0.52) {
          const ga   = ((prog - 0.52) / 0.48) * 0.16;
          const gy   = H * LOGO_CY;
          const grd  = ctx.createRadialGradient(W / 2, gy, 0, W / 2, gy, W * 0.32);
          grd.addColorStop(0, `rgba(232,39,30,${ga.toFixed(3)})`);
          grd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, W, H);
        }

        if (prog >= 1 && phaseRef.current === "forming") {
          setPhase("ready");
          phaseRef.current = "ready";
          document.body.style.overflow = "";
        }
        // Keep animating after assembly: particles stay pinned at their targets
        // so the comet-trails fade out into a crisp wordmark, and the background
        // stars keep twinkling under "SCROLL TO ENTER". Stops on unmount.
        raf = requestAnimationFrame(draw);
      };

      raf = requestAnimationFrame(draw);
    };

    // If anything in setup throws (e.g. a 0-size canvas), never strand the user
    // on a black screen — drop straight to the "scroll to enter" state.
    run().catch((err) => {
      console.warn("Preloader setup failed, entering site:", err);
      if (cancelled) return;
      setProgress(100);
      setPhase("ready");
      phaseRef.current = "ready";
      document.body.style.overflow = "";
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  // Tap / click / keyboard to enter. Wheel scroll is intentionally ignored so
  // the reveal starts cleanly at the hero instead of carrying scroll momentum.
  useEffect(() => {
    if (phase !== "ready") return;

    const dismiss = () => {
      if (phaseRef.current !== "ready") return;
      phaseRef.current = "exiting";
      setPhase("exiting");
      // Pin to the hero so the reveal always starts at the top (the dismiss
      // wheel/scroll must not carry the page down into another section).
      window.scrollTo(0, 0);
      // Reveal the site under the starfield, then let the loader collapse into
      // the same cosmic language as the hero instead of sliding away.
      setTimeout(onDone, 180);
      setTimeout(() => setVisible(false), 1180);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    };

    window.addEventListener("pointerdown", dismiss, { once: true, passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, onDone]);

  if (!visible) return null;

  return (
    <div className={`preloader preloader--${phase}`} aria-hidden="true">
      <canvas ref={canvasRef} className="preloader-canvas" />
      <div className="preloader-stage">
        {phase === "ready" && (
          <div className="preloader-enter">
            <span className="preloader-enter-label">TAP / ENTER</span>
            <span className="preloader-enter-arrow">+</span>
          </div>
        )}
      </div>
      <div className="preloader-meta">
        <span>Loading universe</span>
        <strong>{String(progress).padStart(3, "0")}</strong>
      </div>
      <div className="preloader-bar" style={{ "--p": `${progress}%` } as React.CSSProperties} />
    </div>
  );
}

function ScrollIndicator() {
  return <div className="scroll-progress" aria-hidden="true" />;
}

function Cursor() {
  return (
    <>
      <div className="cursor-dot"  aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true">
        <span>VIEW</span>
      </div>
    </>
  );
}

// Drifting star-network drawn on a canvas: nearby stars link with faint lines,
// and the constellation reaches toward the cursor in red. Part of the cosmos.
function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type P = { x: number; y: number; vx: number; vy: number; r: number; red: boolean };
    let W = 0, H = 0, pts: P[] = [];
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Fewer particles on low-end / touch devices (the O(n²) link pass is the cost).
    const lowEnd =
      (navigator.hardwareConcurrency || 8) <= 4 ||
      window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;

    const build = () => {
      W = canvas.clientWidth || window.innerWidth;
      H = canvas.clientHeight || window.innerHeight;
      canvas.width  = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cap = lowEnd ? 55 : 130;
      const n = Math.min(cap, Math.max(26, Math.round((W * H) / (lowEnd ? 24000 : 15000))));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.3 + 0.4, red: Math.random() < 0.12,
      }));
    };
    build();

    const resize = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); build(); };
    const mouse = { x: -9999, y: -9999, on: false };
    const onMove  = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; };
    const onLeave = () => { mouse.on = false; };
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);

    const LINK2 = 140 * 140, MOUSE2 = 200 * 200;
    let raf = 0;

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      if (!reduce) {
        for (const p of pts) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
          if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
        }
      }
      // star-to-star links
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            const t = 1 - d2 / LINK2;
            const red = a.red || b.red;
            ctx.strokeStyle = red
              ? `rgba(232,39,30,${(t * 0.22).toFixed(3)})`
              : `rgba(242,242,242,${(t * 0.15).toFixed(3)})`;
            ctx.lineWidth = red ? 0.9 : 0.6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // star-to-cursor links (brighter, red)
      if (mouse.on) {
        for (const p of pts) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < MOUSE2) {
            const t = 1 - d2 / MOUSE2;
            ctx.strokeStyle = `rgba(232,39,30,${(t * 0.5).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      // stars
      for (const p of pts) {
        ctx.fillStyle = p.red ? "rgba(232,39,30,0.85)" : "rgba(242,242,242,0.7)";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();

    // Pause the loop entirely when the tab is hidden (no wasted CPU/battery).
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!reduce && raf === 0) { raf = requestAnimationFrame(frame); }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="cosmos-constellation" aria-hidden="true" />;
}

// Immersive case-study card: the project reel fills the card as a cinematic
// background, with the result + story overlaid on a gradient scrim.
function ProjectCard({ project, index }: { project: Project; index: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    video.volume = muted ? 0 : 0.82;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && playing) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [muted, playing]);

  const toggle = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { await v.play(); setPlaying(true); }
    else          { v.pause();      setPlaying(false); }
  };

  const toggleSound = async () => {
    const v = videoRef.current;
    if (!v) return;
    const nextMuted = !muted;
    v.muted = nextMuted;
    v.volume = nextMuted ? 0 : 0.82;
    setMuted(nextMuted);
    if (!nextMuted && v.paused) {
      try {
        await v.play();
        setPlaying(true);
      } catch {
        v.muted = true;
        setMuted(true);
      }
    }
  };

  return (
    <article className="project-card" data-cursor="view">
      {project.video ? (
        <video
          ref={videoRef}
          className="project-card-media"
          src={project.video}
          poster={project.poster}
          muted={muted} autoPlay loop playsInline preload="metadata"
          aria-label={`${project.title} reel`}
        />
      ) : (
        <div className="project-card-media project-card-media--empty" aria-hidden="true">
          <LogoMark />
          <span>Reel slot open</span>
        </div>
      )}
      <div className="project-card-scrim" aria-hidden="true" />
      <div className="project-card-frame" aria-hidden="true" />

      <header className="project-card-top">
        <span className="project-index">{index}</span>
        <span className="project-status">{project.status}</span>
      </header>

      {project.video && (
        <div className="project-controls">
          <button className="project-play" type="button" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} ${project.title}`}>
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            className="project-sound"
            type="button"
            onClick={toggleSound}
            data-muted={muted}
            aria-pressed={!muted}
            aria-label={`${muted ? "Unmute" : "Mute"} ${project.title}`}
          >
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      )}

      <div className="project-card-body">
        <div className="project-card-head">
          <p className="project-category">{project.category}</p>
        </div>
        <h3>{project.title}</h3>
        <p className="project-headline">{project.headline}</p>
        {project.gallery?.length ? (
          <div className="project-gallery" aria-label={`${project.title} supporting visuals`}>
            {project.gallery.slice(0, 3).map((src, i) => (
              <Image key={src} src={src} alt={`${project.title} visual ${i + 1}`} width={96} height={72} />
            ))}
          </div>
        ) : null}
        <div className="project-result">
          <span>{project.outcomeLabel}</span>
          <strong>{project.outcome}</strong>
        </div>
        <div className="project-tags">
          {project.tags.map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>
    </article>
  );
}

function SignalWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0, t = 0, mouse = 0.5;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const onMove = (e: MouseEvent) => { mouse = e.clientY / window.innerHeight; };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const mid = H / 2;
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const amp   = H * 0.16 * (1 - layer * 0.26) * (0.6 + mouse * 0.8);
        const freq  = 0.0055 + layer * 0.0022;
        const speed = t * (0.018 + layer * 0.012);
        for (let x = 0; x <= W; x += 5) {
          const env = Math.sin(x * 0.0011 + t * 0.008);
          const y   = mid + Math.sin(x * freq + speed) * amp * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(232, 39, 30, ${0.55 - layer * 0.15})`;
        ctx.lineWidth   = 2.2 - layer * 0.6;
        ctx.stroke();
      }
      t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="signal-wave" aria-hidden="true" />;
}

function Hero() {
  return (
    <section className="hero" id="intro">
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-inner">
        <p className="hero-kicker">A new-age creative &amp; content studio — Gurgaon</p>
        <div className="hero-view" aria-hidden="true" />
        <p className="hero-tagline">
          We don&apos;t just make content. <em>We make people care.</em>
        </p>
      </div>
      <aside className="hero-card">
        <p className="hero-card-eyebrow">Studio · Gurgaon</p>
        <div className="dashline" />
        <p className="hero-card-body">Built for brands that want relevance, not just reach.</p>
      </aside>
      <div className="hero-scroll" aria-hidden="true">
        <span className="hero-scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}

function AttentionModel() {
  return (
    <section className="attention-model" id="features">
      <SignalWave />
      <div className="attention-glow" aria-hidden="true" />
      <div className="model-title">
        <p className="section-label">What we do</p>
        <h2>We build attention, relevance &amp; growth.</h2>
        <p>
          We study how people actually behave, turn it into content systems, and make attention compound into brand
          value. Insight, speed, execution — no fluff, no filler calendar.
        </p>
      </div>
      <div className="feature-grid">
        {proofStats.map(([label, value, note]) => (
          <article className="feature-card" key={label}>
            <div className="feature-top">
              <span className="feature-icon" aria-hidden="true" />
              <p>{label}</p>
            </div>
            <strong>{value}</strong>
            <div className="dashline" />
            <p>{note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProofSlides() {
  const ref = useRef<HTMLElement>(null);
  // Only play these full-screen reels while the gallery is on screen.
  useEffect(() => {
    const sec = ref.current;
    if (!sec) return;
    const vids = Array.from(sec.querySelectorAll("video"));
    const io = new IntersectionObserver(
      ([e]) => vids.forEach((v) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())),
      { threshold: 0.05 }
    );
    io.observe(sec);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} className="proof-slides" id="proof-gallery" aria-label="Attention proof">
      {proofSlides.map((slide, i) => (
        <article className="proof-slide" key={slide.title} data-idx={i} style={{ opacity: i === 0 ? 1 : 0 }}>
          <video src={slide.media} poster={slide.poster} muted loop playsInline preload="metadata" aria-hidden="true" />
          <div className="proof-vignette" aria-hidden="true" />
          <div className="proof-copy">
            <p>{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <span>{slide.copy}</span>
          </div>
          <div className="proof-chip" aria-hidden="true">
            <div>
              <strong>{slide.metric}</strong>
              <b>{slide.value}</b>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function WorkShowcase() {
  return (
    <>
      <section className="work-product" id="product">
        <div className="work-intro">
          <p className="section-label">The receipts</p>
          <h2>We don&apos;t show everything. Just what moved the needle.</h2>
          <p>
            Open the work, play the reels, and see what actually moved when content was treated as a system, not a
            calendar.
          </p>
          <div className="work-intro-cue" aria-hidden="true">
            <span>Drag / scroll</span>
            <i />
          </div>
        </div>
      </section>
      <section className="cards-section" id="cards-section">
        <div className="project-rail" id="cards-track">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={String(i + 1).padStart(2, "0")} />
          ))}
        </div>
      </section>
    </>
  );
}

const MARQUEE_TOP    = ["CONTENT", "CREATORS", "CAMPAIGNS", "BRANDING", "GROWTH", "REELS", "STRATEGY"];
const MARQUEE_BOTTOM = ["SOCIAL",  "INFLUENCE", "PRODUCTION", "DESIGN",  "PAID ADS", "CULTURE", "LAUNCHES"];

function WhatWeDoMarquee() {
  return (
    <section className="marquee-sec" id="capabilities">
      <div className="marquee-head">
        <p className="section-label">Everything under one roof</p>
        <h2>
          We do a lot. <em>On purpose.</em>
        </h2>
        <p className="marquee-sub">
          One team for content, creators, and growth — so the brand actually moves as one thing.
        </p>
      </div>
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_TOP, ...MARQUEE_TOP].map((word, i) => (
            <span className="marquee-word" key={`t-${i}`}>{word}<i>✺</i></span>
          ))}
        </div>
      </div>
      <div className="marquee marquee--rev">
        <div className="marquee-track">
          {[...MARQUEE_BOTTOM, ...MARQUEE_BOTTOM].map((word, i) => (
            <span className="marquee-word marquee-word--ghost" key={`b-${i}`}>{word}<i>/</i></span>
          ))}
        </div>
      </div>
    </section>
  );
}

const MANIFESTO_POINTS = [
  ["Insight-led", "We study behaviour before we make a single frame."],
  ["System, not calendar", "Repeatable formats that compound into brand memory."],
  ["Built to convert", "Attention is the start — movement is the point."],
];

// Auto-updating "latest reel" card — pulls the most recent post from a Behold.so
// JSON feed (set NEXT_PUBLIC_BEHOLD_FEED_ID in .env.local). Falls back to a local
// reel until the feed is connected, so the space always looks intentional.
type BeholdSize = { mediaUrl?: string };
type BeholdPost = {
  mediaType?: string; media_type?: string;
  mediaUrl?: string; media_url?: string;
  thumbnailUrl?: string; thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  sizes?: { full?: BeholdSize; large?: BeholdSize; medium?: BeholdSize };
};

function LatestReel() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [post, setPost] = useState<{ media: string; thumb?: string; permalink: string; isVideo: boolean } | null>(null);

  useEffect(() => {
    // Public Behold feed id (same one in the widget embed) — hardcoded as a
    // default so the card works on Vercel even without the env var set; the env
    // var overrides it if present.
    const id = process.env.NEXT_PUBLIC_BEHOLD_FEED_ID || "bDimAptWlG8fo0gknVwk";
    if (!id) return;
    let alive = true;
    fetch(`https://feeds.behold.so/${id}?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: BeholdPost[] | { posts?: BeholdPost[] }) => {
        if (!alive) return;
        const raw = Array.isArray(data) ? data : data.posts ?? [];
        // Always newest-first, regardless of the order Behold returns them in.
        const posts = [...raw].sort(
          (a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
        );
        const pick = posts[0]; // the actual latest post — image OR video
        if (!pick) return;
        const isVideo = (pick.mediaType ?? pick.media_type) === "VIDEO";
        // Images: prefer Behold's stable proxied URL over the expiring IG CDN link.
        const stableImg = pick.sizes?.full?.mediaUrl ?? pick.sizes?.large?.mediaUrl ?? pick.sizes?.medium?.mediaUrl;
        setPost({
          media: isVideo
            ? (pick.mediaUrl ?? pick.media_url ?? "")
            : (stableImg ?? pick.mediaUrl ?? pick.media_url ?? ""),
          thumb: pick.thumbnailUrl ?? pick.thumbnail_url,
          permalink: pick.permalink ?? "https://instagram.com/studio.snag",
          isVideo,
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * 18).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 22).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  const media = post?.media || "/assets/work/superprofile.mp4";
  const isVideo = post ? post.isVideo : true;
  const href = post?.permalink ?? "https://instagram.com/studio.snag";

  return (
    <a
      ref={ref}
      className="latest-reel"
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor="view"
      aria-label="Latest reel on Instagram"
    >
      <span className="latest-reel-glow" aria-hidden="true" />
      <div className="latest-reel-card">
        <div className="latest-reel-inner">
          {isVideo ? (
            <video src={media} poster={post?.thumb} muted autoPlay loop playsInline preload="metadata" aria-hidden="true" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media} alt="" />
          )}
          <span className="latest-reel-scrim" aria-hidden="true" />
          <span className="latest-reel-glare" aria-hidden="true" />
        </div>
        <span className="latest-reel-live"><i />Live</span>
        <span className="latest-reel-meta">
          <strong>Latest on Instagram</strong>
          <em>{brand.instagram}</em>
        </span>
      </div>
    </a>
  );
}

// Small lead-capture form → posts to a Google Apps Script web app that appends a
// row to a Sheet. Set NEXT_PUBLIC_SHEET_FORM_URL (no-cors fire-and-forget; we show
// an optimistic success once the request is sent).
function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const url = process.env.NEXT_PUBLIC_SHEET_FORM_URL;
    const fd = new FormData(form);
    const data = new URLSearchParams();
    fd.forEach((v, k) => data.append(k, String(v)));
    if (!url) { setState("error"); return; }
    setState("sending");
    try {
      await fetch(url, { method: "POST", mode: "no-cors", body: data });
      setState("sent");
      form.reset();
    } catch {
      setState("error");
    }
  };

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <input className="contact-input" name="name" required placeholder="Your name" autoComplete="name" />
      <input className="contact-input" name="contact" required placeholder="Email or phone" autoComplete="email" />
      <textarea className="contact-input" name="message" required rows={3} placeholder="What do you need? A line or two is plenty." />
      <button
        type="submit"
        className="contact-cta-btn contact-form-submit"
        disabled={state === "sending" || state === "sent"}
        data-cursor="view"
      >
        {state === "sent" ? "Sent ✓" : state === "sending" ? "Sending…" : <>Send the brief<ArrowRight size={18} /></>}
      </button>
      {state === "sent" && <p className="contact-form-msg" role="status">Got it — we&apos;ll reply within a day.</p>}
      {state === "error" && (
        <p className="contact-form-msg contact-form-msg--err" role="status">Couldn&apos;t send — email {brand.email} instead.</p>
      )}
    </form>
  );
}

function OpenWeightProof() {
  return (
    <section className="open-proof" id="studio">
      <div className="open-proof-head">
        <div className="open-proof-head-copy">
          <p className="section-label">Who we are</p>
          <h2 className="open-proof-title">
            We don&apos;t chase reach. <em>We engineer attention</em> that turns into brand value.
          </h2>
        </div>
        <LatestReel />
      </div>

      <div className="manifesto">
        <div className="manifesto-lead">
          <p>
            A hybrid of creators, strategists, and operators — we started in social and grew into a
            full-stack studio for talent, influence, and cultural impact.
          </p>
          <p className="manifesto-sign">
            No outdated playbooks. No vanity metrics. Just sharp strategy, strong execution, and{" "}
            <span>content that actually moves.</span>
          </p>
        </div>
        <ol className="manifesto-points">
          {MANIFESTO_POINTS.map(([title, body], i) => (
            <li key={title}>
              <span className="mp-index">{String(i + 1).padStart(2, "0")}</span>
              <p><strong>{title}.</strong> {body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="capabilities-block">
        <div className="capabilities-head">
          <p className="capabilities-label">What we do</p>
          <h3 className="capabilities-title">One team. The full stack.</h3>
          <p className="capabilities-intro">
            Content, creators, and growth under a single roof — so your brand moves as one thing,
            not five disconnected vendors.
          </p>
        </div>
        <div className="service-grid">
          {services.slice(0, 8).map((service) => {
            const Icon = service.icon;
            return (
              <article className="service-card" key={service.title}>
                <span className="service-icon" aria-hidden="true"><Icon size={20} /></span>
                <h4>{service.title}</h4>
                <p>{service.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Mute-by-default ambient space audio. The file is a short loop in /public,
// and playback only starts after the user explicitly taps the corner toggle.
function AudioToggle() {
  const ref = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);

  const toggle = async () => {
    const a = ref.current;
    if (!a) return;
    if (on) {
      a.pause();
      setOn(false);
    } else {
      a.volume = 0.32;
      try {
        await a.play();
        setOn(true);
      } catch {
        setOn(false);
      }
    }
  };

  return (
    <>
      <audio ref={ref} src="/assets/audio/snag-ambient.wav" loop preload="none" />
      <button
        type="button"
        className="audio-toggle"
        data-on={on}
        onClick={toggle}
        aria-label={on ? "Turn ambient sound off" : "Turn ambient sound on"}
      >
        {on ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span className="audio-eq" aria-hidden="true"><i /><i /><i /><i /></span>
      </button>
    </>
  );
}

// ─── Root component ────────────────────────────────────────────────────────────

export default function SnagExperience() {
  const appRef  = useRef<HTMLDivElement>(null);
  const [webglOn, setWebglOn]   = useState(false);
  const [siteReady, setSiteReady] = useState(false);

  const handlePreloaderDone = useCallback(() => setSiteReady(true), []);

  // WebGL capability check (runs immediately)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let supported = false;
    try {
      const c = document.createElement("canvas");
      const test = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
      supported = !!test;
      // Free the probe context immediately — leaking it eats into the browser's
      // hard cap on live WebGL contexts (which can starve the real Canvas).
      test?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { supported = false; }
    const frame = window.requestAnimationFrame(() => setWebglOn(supported && !reduce));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Cursor (runs immediately — works even during preloader)
  useEffect(() => {
    const dot  = document.querySelector<HTMLElement>(".cursor-dot");
    const ring = document.querySelector<HTMLElement>(".cursor-ring");
    let cx = 0, cy = 0, rx = 0, ry = 0, frame = 0;

    const onMove = (e: PointerEvent) => {
      cx = e.clientX; cy = e.clientY;
      if (dot) { dot.style.left = `${cx}px`; dot.style.top = `${cy}px`; }
    };
    const loop = () => {
      rx += (cx - rx) * 0.14; ry += (cy - ry) * 0.14;
      if (ring) { ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; }
      frame = requestAnimationFrame(loop);
    };
    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button,[data-cursor='view']"))
        document.body.classList.add("cursor-grow");
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a,button,[data-cursor='view']"))
        document.body.classList.remove("cursor-grow");
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseover",  onOver);
    document.addEventListener("mouseout",   onOut);
    loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mouseout",   onOut);
    };
  }, []);

  // Cosmos scroll parallax — star/nebula layers drift at different rates for
  // depth as you move through the page (cheap: one CSS var, rAF-throttled).
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const apply = () => {
      frame = 0;
      root.style.setProperty("--cosmos-y", String(window.scrollY || 0));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(apply); };
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  // GSAP + Lenis — gated until preloader is dismissed
  useEffect(() => {
    if (!siteReady) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile     = window.matchMedia("(max-width: 900px)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Start at the hero — guard against any restored/carried scroll position.
    window.scrollTo(0, 0);
    const lenis = reduceMotion ? null : new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis?.scrollTo(0, { immediate: true });
    const raf   = (time: number) => lenis?.raf(time * 1000);

    if (lenis) {
      lenis.on("scroll", (e: { velocity?: number; progress?: number }) => {
        ScrollTrigger.update();
        useScrollStore.getState().setScroll(e.progress ?? 0, e.velocity ?? 0);
      });
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    if (!reduceMotion) {
      gsap.to(".scroll-progress", {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: document.documentElement, start: 0, end: "max", scrub: 0.2 },
      });

      gsap.to(".hero-inner", {
        yPercent: -8, autoAlpha: 0.15, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "30% top", end: "bottom top", scrub: true },
      });

      const attentionEl = document.querySelector<HTMLElement>(".attention-model");
      const glowEl      = document.querySelector<HTMLElement>(".attention-glow");
      if (attentionEl && glowEl) {
        attentionEl.addEventListener("mousemove", (e) => {
          const rect = attentionEl.getBoundingClientRect();
          const x    = (((e as MouseEvent).clientX - rect.left) / rect.width)  * 100;
          const y    = (((e as MouseEvent).clientY - rect.top)  / rect.height) * 100;
          gsap.to(glowEl, { "--glow-x": `${x.toFixed(1)}%`, "--glow-y": `${y.toFixed(1)}%`, "--glow-opacity": "1", duration: 0.5, ease: "power2.out" });
        });
        attentionEl.addEventListener("mouseleave", () => {
          gsap.to(glowEl, { "--glow-opacity": "0", duration: 0.7 });
        });
      }

      // Proof gallery
      const proofGallery  = document.getElementById("proof-gallery");
      const proofSlideEls = proofGallery?.querySelectorAll<HTMLElement>(".proof-slide");
      const total         = proofSlideEls?.length ?? 0;
      if (proofGallery && proofSlideEls && total > 0) {
        let current = 0;
        proofSlideEls.forEach((s, i) => gsap.set(s, { autoAlpha: i === 0 ? 1 : 0, clipPath: "inset(0% 0% 0% 0%)" }));
        const revealCopy = (slide: HTMLElement) => {
          const copy = slide.querySelector(".proof-copy");
          if (copy) gsap.fromTo(copy.children, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.12 });
        };
        revealCopy(proofSlideEls[0]);
        ScrollTrigger.create({
          trigger: proofGallery, start: "top top", end: `+=${total * 150}%`, pin: true, pinSpacing: true, refreshPriority: 3,
          onUpdate: (self) => {
            const idx = Math.min(Math.floor(self.progress * total * 0.999), total - 1);
            if (idx === current) return;
            const down     = idx > current;
            const incoming = proofSlideEls[idx];
            const outgoing = proofSlideEls[current];
            gsap.to(outgoing, { autoAlpha: 0, duration: 0.45, ease: "power2.inOut", overwrite: true });
            gsap.fromTo(incoming,
              { autoAlpha: 1, clipPath: down ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power3.inOut", overwrite: true }
            );
            revealCopy(incoming);
            current = idx;
          },
        });
      }

      // Horizontal cards (desktop only). Created synchronously (in DOM order)
      // with refreshPriority so this and the contact pin resolve positions
      // correctly — the deferred-rAF version mis-ordered the pins.
      const cardsSection = document.getElementById("cards-section");
      const cardsTrack   = document.getElementById("cards-track");
      if (cardsSection && cardsTrack && !isMobile) {
        const totalScrollWidth = cardsTrack.scrollWidth - window.innerWidth;
        if (totalScrollWidth > 0) {
          gsap.to(cardsTrack, {
            x: -totalScrollWidth, ease: "none",
            scrollTrigger: { trigger: cardsSection, start: "top top", end: `+=${totalScrollWidth}`, pin: true, scrub: 1, anticipatePin: 1, refreshPriority: 2 },
          });
        }
      }

      // Contact signal lock: the CTA appears as a control-panel signal resolving
      // from the starfield. It stays calmer than the previous burst animation.
      const contactSec = document.querySelector<HTMLElement>(".contact");
      const stars         = gsap.utils.toArray<HTMLElement>(".contact-star");
      const aura          = document.querySelector<HTMLElement>(".contact-aura");
      const threshold     = document.querySelector<HTMLElement>(".contact-threshold");
      const thresholdCore = document.querySelector<HTMLElement>(".contact-threshold-core");
      const thresholdLines = gsap.utils.toArray<HTMLElement>(".contact-threshold-line");
      const reveal        = document.querySelector<HTMLElement>(".contact-reveal");
      const cta           = document.querySelector<HTMLElement>(".contact-cta");
      const ctaBtn        = document.querySelector<HTMLElement>(".contact-cta-btn");
      const revealKids    = gsap.utils.toArray<HTMLElement>(".contact-reveal > *");
      if (contactSec && stars.length && reveal && threshold && thresholdCore && !isMobile) {
        const N    = stars.length;
        const ang  = (i: number) => (i / N) * Math.PI * 2 + (i % 5) * 0.5;
        const dist = (i: number) => 90 + (i % 6) * 28;
        gsap.set(stars, {
          x: (i: number) => Math.cos(ang(i)) * dist(i),
          y: (i: number) => Math.sin(ang(i)) * dist(i),
          scale: 0.4,
          autoAlpha: 0,
        });
        gsap.set(aura, { autoAlpha: 0, scale: 0.82 });
        gsap.set(threshold, { autoAlpha: 0 });
        gsap.set(thresholdLines, { scaleX: 0, autoAlpha: 0 });
        gsap.set(thresholdCore, { scale: 0.35, autoAlpha: 0 });
        gsap.set(reveal, { autoAlpha: 0, clipPath: "inset(14% 0% 0% 0%)" });
        gsap.set(cta, { "--signal": "0%" });
        gsap.set(ctaBtn, { boxShadow: "0 0 0 rgba(232,39,30,0)" });

        // No pin — plays once as the section scrolls into view, so there's no
        // empty held "dead scroll" before the content. The signal-lock still
        // resolves: threshold → stars → content → CTA.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: contactSec, start: "top 68%" },
        });
        tl
          .to(threshold, { autoAlpha: 1, duration: 0.25 }, 0)
          .to(thresholdLines, { scaleX: 1, autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 0.05)
          .to(thresholdCore, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" }, 0.12)
          .to(stars, { scale: 1, autoAlpha: 0.82, duration: 0.7, ease: "power2.out", stagger: { each: 0.01, from: "center" } }, 0.12)
          .to(aura, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power2.out" }, 0.25)
          .to(threshold, { autoAlpha: 0, yPercent: -30, duration: 0.4, ease: "power2.in" }, 0.5)
          .to(reveal, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power3.out" }, 0.5)
          .from(revealKids, { y: 48, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }, 0.55)
          .to(cta, { "--signal": "100%", duration: 0.5, ease: "power2.out" }, 0.8)
          .to(ctaBtn, { boxShadow: "0 0 44px rgba(232,39,30,0.5)", duration: 0.4, ease: "power2.out" }, 0.9)
          .to(stars, { autoAlpha: 0.18, duration: 0.5, ease: "power2.out" }, 1.1);
      }

      // Hero entrance (plays right as preloader exits)
      gsap.from(".hero-kicker",  { autoAlpha: 0, y: 24, duration: 0.7,  ease: "power2.out" });
      gsap.from(".hero-tagline", { autoAlpha: 0, y: 30, duration: 0.85, ease: "power2.out", delay: 0.25 });
      gsap.from(".hero-card",    { autoAlpha: 0, y: 24, duration: 0.7,  ease: "power2.out", delay: 0.4  });
      gsap.from(".hero-scroll",  { autoAlpha: 0, duration: 0.7, ease: "power2.out", delay: 0.55 });

      // Stat count-up
      gsap.utils.toArray<HTMLElement>(".feature-card strong").forEach((el) => {
        const raw = el.textContent || "";
        const m   = raw.match(/^(\d+)(.*)$/);
        if (!m) return;
        const target = parseInt(m[1], 10);
        const suffix = m[2];
        const obj    = { n: 0 };
        ScrollTrigger.create({
          trigger: el, start: "top 92%", once: true,
          onEnter: () => gsap.to(obj, { n: target, duration: 1.5, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(obj.n) + suffix; } }),
        });
      });

      document.querySelectorAll<HTMLElement>("h2").forEach((el) => {
        if (el.closest(".hero") || el.closest(".proof-slide") || el.closest(".contact")) return;
        const split = new SplitType(el, { types: "lines" });
        const lines = split.lines ?? [];
        lines.forEach((line) => {
          const wrap = document.createElement("span");
          Object.assign(wrap.style, { display: "block", overflow: "hidden" });
          line.parentElement?.insertBefore(wrap, line);
          wrap.appendChild(line);
        });
        gsap.from(lines, { yPercent: 110, duration: 0.95, stagger: 0.09, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
      });

      document.querySelectorAll<HTMLElement>(".section-label").forEach((el) => {
        gsap.from(el, { y: 16, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });

        gsap.utils.toArray<HTMLElement>(".feature-card, .open-proof article").forEach((el) => {
        gsap.from(el, { y: 60, opacity: 0, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
      });

      ScrollTrigger.refresh();
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (lenis) { gsap.ticker.remove(raf); lenis.destroy(); }
    };
  }, [siteReady]);

  return (
    <div ref={appRef} className="app-root">
      {/* Persistent deep-space backdrop behind every section (drifting stars + nebula). */}
      <div className="cosmos" aria-hidden="true">
        <span className="cosmos-stars cosmos-stars--far" />
        <span className="cosmos-stars cosmos-stars--near" />
        <span className="cosmos-neb cosmos-neb--1" />
        <span className="cosmos-neb cosmos-neb--2" />
        <Constellation />
      </div>
      {webglOn && (
        <WebGLBoundary>
          <Scene eventSource={appRef} />
        </WebGLBoundary>
      )}
      <Preloader onDone={handlePreloaderDone} />
      <ScrollIndicator />
      <Cursor />
      <AudioToggle />
      {/* Cinematic grade: vignette + in-palette lens bloom + drifting leak. */}
      <div className="cinema" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <main>
        <Hero />
        <AttentionModel />
        <ProofSlides />
        <WorkShowcase />
        <WhatWeDoMarquee />
        <OpenWeightProof />
        <section className="contact" id="contact">
          <div className="contact-burst" aria-hidden="true">
            {Array.from({ length: 36 }).map((_, i) => (
              <span key={i} className={i % 6 === 0 ? "contact-star contact-star--red" : "contact-star"} />
            ))}
          </div>
          <div className="contact-stage">
            <span className="contact-aura" aria-hidden="true" />
            <div className="contact-threshold" aria-hidden="true">
              <span className="contact-threshold-line" />
              <span className="contact-threshold-core" />
              <span className="contact-threshold-line" />
            </div>
            <div className="contact-reveal">
              <div className="footer-punch">
                <div className="footer-punch-copy">
                  <p className="contact-kicker">Open line</p>
                  <h2>
                    Let&apos;s build something that actually <em>moves.</em>
                  </h2>
                  <p className="contact-flex">
                    This was just supposed to be a portfolio — and we built it <em>like this</em>. Now imagine what we&apos;d do with your brand.
                  </p>
                </div>
              </div>
              <div className="contact-cta contact-console">
                <span className="contact-tick contact-tick--tl" aria-hidden="true" />
                <span className="contact-tick contact-tick--tr" aria-hidden="true" />
                <span className="contact-tick contact-tick--bl" aria-hidden="true" />
                <span className="contact-tick contact-tick--br" aria-hidden="true" />
                <p className="contact-cta-kicker">Tell us what you&apos;re building</p>
                <ContactForm />
                <a className="contact-cta-btn contact-cta-btn--ghost" href={`https://wa.me/${brand.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" data-cursor="view">
                  <MessageCircle size={17} />WhatsApp instead
                </a>
                <div className="contact-channels">
                  <a href={`mailto:${brand.email}`} data-cursor="view"><Mail size={15} />{brand.email}</a>
                  <a href="https://instagram.com/studio.snag" target="_blank" rel="noreferrer" data-cursor="view"><AtSign size={15} />{brand.instagram}</a>
                  <a href={`tel:${brand.phone.replace(/\s/g, "")}`} data-cursor="view"><Phone size={15} />{brand.phone}</a>
                  <a href={`tel:${brand.phone2.replace(/\s/g, "")}`} data-cursor="view"><Phone size={15} />{brand.phone2}</a>
                </div>
                <div className="contact-offices">
                  <div className="contact-office"><MapPin size={15} /><span><strong>Gurgaon</strong>{brand.location}</span></div>
                  <div className="contact-office"><MapPin size={15} /><span><strong>Ranchi</strong>{brand.location2}</span></div>
                </div>
                <p className="contact-cta-note">Limited projects. Built with intent — usually a reply within a day.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a href="#intro" className="footer-back" data-cursor="view" aria-label="Back to top">
          <ArrowRight size={15} />
          <span>Back to top</span>
        </a>
        <div className="footer-mark" aria-hidden="true">
          <LogoMark />
        </div>
        <div className="footer-meta">
          <div className="footer-links">
            <a href={`mailto:${brand.email}`} data-cursor="view">{brand.email}</a>
            <a href="https://instagram.com/studio.snag" target="_blank" rel="noreferrer" data-cursor="view">{brand.instagram}</a>
            <a href={`tel:${brand.phone.replace(/\s/g, "")}`} data-cursor="view">{brand.phone}</a>
            <a href={`tel:${brand.phone2.replace(/\s/g, "")}`} data-cursor="view">{brand.phone2}</a>
          </div>
          <p className="footer-loc"><strong>Gurgaon</strong> — {brand.location}</p>
          <p className="footer-loc"><strong>Ranchi</strong> — {brand.location2}</p>
          <p className="footer-credits">© {new Date().getFullYear()} SNAG — We make people care.</p>
        </div>
      </footer>
    </div>
  );
}
