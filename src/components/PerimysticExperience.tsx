"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ArrowRight, AtSign, Mail, Phone, MapPin, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { brand, projects, services, type Project } from "@/lib/content";
import { useScrollStore } from "@/webgl/store";

gsap.registerPlugin(ScrollTrigger);

const Scene = dynamic(() => import("@/webgl/Scene"), { ssr: false });

const proofStats = [
  ["Creator relationships", "100+", "From the founder's work before Perimystic."],
  ["Paid activations", "500+", "Creator-led activations across previous marketing roles."],
  ["Brands built", "02", "Body Juices and Barber Syndicate — built from scratch before Perimystic."],
];
type ProofSlide = {
  eyebrow: string; title: string; copy: string;
  media: string; poster?: string; metric: string; value: string;
};
// Three full-screen pinned showcase reels. Media points at clean slugs in
// /assets/work/ — drop the renamed files there (see rename map). Copy is lean
// placeholder; the bold/quirky rewrite happens in the text pass.
const proofSlides: ProofSlide[] = [
  { eyebrow: "Founder work 01 — Depano", title: "A sharper point of view.",
    copy: "Fashion positioning and content direction from a previous role.",
    media: "/assets/work/pinned-1.mp4", poster: "/assets/posters/depano.png",
    metric: "Focus", value: "Brand direction" },
  { eyebrow: "Founder work 02 — Burger Bae", title: "Content with an appetite.",
    copy: "Freelance social creative and creator-led campaigns, before Perimystic.",
    media: "/assets/media/burger-bae.mp4", poster: "/assets/posters/burger-bae.png",
    metric: "Discipline", value: "Content + creators" },
  { eyebrow: "Founder work 03 — SuperProfile", title: "People make the movement.",
    copy: "Creator partnerships and campaign systems from a previous role.",
    media: "/assets/media/peribest.mp4", poster: "/assets/posters/peribest.png",
    metric: "Focus", value: "Creator partnerships" },
];

// Approved original logo supplied by the owner and committed as a real image.
function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-artwork ${className}`}>
      <Image
        src="/assets/branding/perimystic-logo.webp"
        alt="Perimystic Marketing Agency — Insight, Strategy, Impact"
        width={1080} height={1080} priority unoptimized className="brand-artwork-image"
      />
    </span>
  );
}

// A failed/lost WebGL context (or postprocessing init) must never white-screen
// the whole page — fall back to the CSS cosmos + content if the 3D layer throws.
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: unknown) { console.warn("[PERIMYSTIC] WebGL layer disabled:", err); }
  render() { return this.state.failed ? null : this.props.children; }
}

// An automatic, accessible opening card based on the actual signboard palette.
// Uses the approved logo image once it is supplied, with a typographic placeholder
// until then. No canvas, particles, forced click, or lingering scroll lock.
function Preloader({ onDone }: { onDone: (skipped?: boolean) => void }) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const finished = useRef(false);
  const finishTimer = useRef<number | null>(null);

  const finish = useCallback((skipped = false) => {
    if (finished.current) return;
    finished.current = true;
    try { sessionStorage.setItem("perimystic:intro", "1"); } catch { /* private browsing */ }
    if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    document.body.style.overflow = "";
    setExiting(true);
    // Reveal only after the paper card has softened into the hero.
    finishTimer.current = window.setTimeout(() => {
      onDone(skipped);
      setVisible(false);
    }, skipped ? 0 : 420);
  }, [onDone]);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("perimystic:intro") === "1"; } catch { /* private browsing */ }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Repeated visits and users who prefer less animation go straight in.
    if (seen || reduce) {
      const id = window.requestAnimationFrame(() => finish(true));
      return () => window.cancelAnimationFrame(id);
    }

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    const introTimer = window.setTimeout(() => finish(false), 1750);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        finish(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(introTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [finish]);

  useEffect(() => () => {
    if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
    document.body.style.overflow = "";
  }, []);

  if (!visible) return null;

  return (
    <div className={`preloader peri-opening ${exiting ? "peri-opening--exiting" : ""}`}
      role="dialog" aria-label="Perimystic opening animation" aria-modal="true">
      <div className="peri-opening-frame" aria-hidden="true">
        <span className="peri-opening-corner peri-opening-corner--tl">✥</span>
        <span className="peri-opening-corner peri-opening-corner--tr">✥</span>
        <span className="peri-opening-corner peri-opening-corner--bl">✥</span>
        <span className="peri-opening-corner peri-opening-corner--br">✥</span>
      </div>
      <div className="peri-opening-content">
        <p className="peri-opening-eyebrow">रणनीति <span aria-hidden="true">✦</span> परिणाम</p>
        <div className="peri-opening-reveal"><LogoMark className="peri-opening-logo" /></div>
        <div className="peri-opening-rule" aria-hidden="true"><span>✣</span></div>
        <p className="peri-opening-subtitle">Insight <span>◆</span> Strategy <span>◆</span> Impact</p>
      </div>
      <button className="peri-opening-skip" type="button"
        onClick={() => finish(true)} aria-label="Skip introduction">
        Skip intro <ArrowRight size={15} />
      </button>
      <div className="peri-opening-progress" aria-hidden="true" />
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

    const tryPlay = () => {
      // Mobile blocks autoplay unless the element is reliably muted — retry muted
      // if the first attempt is rejected.
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && playing) tryPlay();
        else video.pause();
      },
      { threshold: 0.25 }
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
          muted={muted} loop playsInline preload="none" disablePictureInPicture
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

function AttentionModel() {
  return (
    <section className="attention-model" id="features">
      <SignalWave />
      <div className="attention-glow" aria-hidden="true" />
      <div className="model-title">
        <p className="section-label">What we do</p>
        <h2>We make brands hard to ignore.</h2>
        <p>
          We bring strategy, creative thinking and the right people together. From content to creator campaigns,
          we believe brands should make something worth noticing.
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

  useEffect(() => {
    const sec = ref.current;
    if (!sec) return;
    const vids = Array.from(sec.querySelectorAll<HTMLVideoElement>(".proof-slide video"));
    const mobile = window.matchMedia("(max-width: 900px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Hidden desktop layers must never steal keyboard or screen reader focus.
    sec.querySelectorAll<HTMLElement>(".proof-slide").forEach((slide, i) => {
      slide.inert = !mobile && i !== 0;
      if (!mobile && i !== 0) slide.setAttribute("aria-hidden", "true");
      else slide.removeAttribute("aria-hidden");
    });
    const play = (v: HTMLVideoElement) => {
      if (reduceMotion || document.hidden) return;
      v.muted = true;
      v.play().catch(() => { /* Mobile autoplay can be declined */ });
    };
    const syncDesktop = () => {
      if (mobile) return;
      vids.forEach((v) => {
        if (v.closest<HTMLElement>(".proof-slide")?.dataset.active === "true" &&
            sec.getBoundingClientRect().bottom > 0 &&
            sec.getBoundingClientRect().top < window.innerHeight) play(v);
        else v.pause();
      });
    };
    // On phones the slides become a native vertical stack; decode only a reel
    // in view, rather than three layered full-screen videos at once.
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const v = entry.target as HTMLVideoElement;
        if (mobile) {
          if (entry.isIntersecting && entry.intersectionRatio >= .45) play(v);
          else v.pause();
        } else {
          syncDesktop();
        }
      }
    }, { threshold: [0, .45, .8] });
    vids.forEach(v => observer.observe(v));
    const onSlideChange = () => syncDesktop();
    const onVisibility = () => {
      if (document.hidden) vids.forEach(v => v.pause());
      else syncDesktop();
    };
    sec.addEventListener("perimystic:slide-change", onSlideChange);
    document.addEventListener("visibilitychange", onVisibility);
    syncDesktop();
    return () => {
      observer.disconnect();
      sec.removeEventListener("perimystic:slide-change", onSlideChange);
      document.removeEventListener("visibilitychange", onVisibility);
      vids.forEach(v => v.pause());
    };
  }, []);

  return (
    <section ref={ref} className="proof-slides cinematic-hero" id="proof-gallery"
      aria-label="Perimystic creative marketing showcase">
      <span id="intro" className="cinematic-top-anchor" aria-hidden="true" />
      <nav className="cinematic-hero-nav" aria-label="Main navigation">
        <a className="cinematic-brand" href="#intro" aria-label="Perimystic, back to top">
          <Image src="/assets/branding/perimystic-crest.webp" alt="" width={80} height={64} priority unoptimized />
          <span className="cinematic-brand-name">PERIMYSTIC <small>MARKETING AGENCY</small></span>
        </a>
        <div className="cinematic-nav-links">
          <span className="cinematic-location">CHANDIGARH <i>◆</i> DELHI NCR</span>
          <a href="#capabilities">WHAT WE DO</a>
          <a className="cinematic-nav-cta" href="#contact">LET&apos;S TALK <ArrowRight size={15} /></a>
        </div>
      </nav>
      {proofSlides.map((slide, i) => (
        <article className="proof-slide cinematic-slide" key={slide.title}
          data-idx={i} data-active={i === 0 ? "true" : "false"}
          style={{ opacity: i === 0 ? 1 : 0 }}>
          <video src={slide.media} poster={slide.poster}
            muted loop playsInline preload={i === 0 ? "metadata" : "none"}
            disablePictureInPicture aria-hidden="true" />
          <div className="proof-vignette" aria-hidden="true" />
          <div className="cinematic-frame" aria-hidden="true" />
          <div className="proof-copy cinematic-copy">
            <p className="cinematic-eyebrow">{slide.eyebrow}</p>
            {i === 0 ? (
              <h1>GOOD BRANDS <em>MAKE A SCENE.</em></h1>
            ) : (
              <h2>{slide.title}</h2>
            )}
            <span>{i === 0 ? "We turn ideas into stories people notice. Social, creators and campaigns with real character." : slide.copy}</span>
            <div className="cinematic-actions">
              <a href="#contact" className="cinematic-primary-cta">
                BUILD WITH US <ArrowRight size={17} />
              </a>
              <a href="#cards-section" className="cinematic-secondary-cta">EXPLORE THE WORK</a>
            </div>
          </div>
          <div className="cinematic-slide-foot">
            <span>SELECTED FOUNDER WORK <i>◆</i> BEFORE PERIMYSTIC</span>
            <span className="cinematic-slide-index">0{i + 1}<b>/</b>03</span>
            <span>SCROLL TO EXPLORE <span className="cinematic-scroll-arrow">↓</span></span>
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
          <p className="section-label">The founder’s earlier work</p>
          <h2>The work before the name.</h2>
          <p>
            Selected work from previous roles and freelance projects. These are founder experience examples,
            not projects contracted through Perimystic.
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

const MARQUEE_TOP = ["CONTENT", "CREATORS", "CAMPAIGNS", "BOLD IDEAS", "SOCIAL", "REELS", "CULTURE"];
const MARQUEE_BOTTOM = ["THODA HATKE", "FULL POWER", "BRAND LOVE", "CREATIVE", "STORIES", "LAUNCHES"];

function WhatWeDoMarquee() {
  return (
    <section className="marquee-sec" id="capabilities">
      <div className="marquee-head">
        <p className="section-label">Our kind of work</p>
        <h2>
          Less noise. <em>More feeling.</em>
        </h2>
        <p className="marquee-sub">
          Strategy, content and creators working together, with one distinctive point of view.
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
    const id = process.env.NEXT_PUBLIC_PERIMYSTIC_BEHOLD_FEED_ID;
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
          permalink: pick.permalink ?? brand.instagramUrl,
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
  const href = post?.permalink || brand.instagramUrl || "#work";

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
        <span className="latest-reel-live"><i />{post ? "Latest" : "Archive"}</span>
        <span className="latest-reel-meta">
          <strong>{post ? "Latest on Instagram" : "Founder work"}</strong>
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
    const url = process.env.NEXT_PUBLIC_PERIMYSTIC_SHEET_FORM_URL;
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
        <p className="contact-form-msg contact-form-msg--err" role="status">Couldn&apos;t send. Please try our Instagram instead.</p>
      )}
    </form>
  );
}

function OpenWeightProof() {
  return (
    <section className="open-proof" id="studio">
      <div className="open-proof-head">
        <div className="open-proof-head-copy">
          <p className="section-label">Meet the new kid in town</p>
          <h2 className="open-proof-title">
            Same internet. <em>Different kind of energy.</em>
          </h2>
        </div>
        <LatestReel />
      </div>

      <div className="manifesto">
        <div className="manifesto-lead">
          <p>
            Perimystic is a founder-led creative marketing agency for consumer brands.
            We bring social content, creator thinking and campaign ideas together — with a distinctly Indian eye for colour and culture.
          </p>
          <p className="manifesto-sign">
            Not here to sell a hundred vague services. Here to make sharp work, execute it properly,
            and give brands <span>something to be remembered for.</span>
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
          <h3 className="capabilities-title">Three things. Done well.</h3>
          <p className="capabilities-intro">
            Social and content management, creator campaigns, and brand launch creative.
              Built with the right specialists for each project.
          </p>
        </div>
        <div className="service-grid">
          {services.map((service) => {
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
// ─── Root component ────────────────────────────────────────────────────────────

export default function PerimysticExperience() {
  const appRef  = useRef<HTMLDivElement>(null);
  const [webglOn, setWebglOn]   = useState(false);
  const [siteReady, setSiteReady] = useState(false);
  // Set when the preloader was skipped (already seen this session) so we keep the
  // browser's restored scroll position instead of forcing the hero top.
  const skippedIntroRef = useRef(false);

  const handlePreloaderDone = useCallback((skipped = false) => {
    skippedIntroRef.current = skipped;
    setSiteReady(true);
  }, []);

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

    // Fresh intro → start at the hero; skipped intro (reload/back) → keep the
    // scroll position the browser restored.
    if (!skippedIntroRef.current) window.scrollTo(0, 0);
    // Native scroll on touch is smoother than Lenis' rAF-driven smoothing.
    const lenis = (reduceMotion || isMobile) ? null : new Lenis({ lerp: 0.085, smoothWheel: true });
    if (!skippedIntroRef.current) lenis?.scrollTo(0, { immediate: true });
    const raf   = (time: number) => lenis?.raf(time * 1000);

    if (lenis) {
      lenis.on("scroll", (e: { velocity?: number; progress?: number }) => {
        ScrollTrigger.update();
        useScrollStore.getState().setScroll(e.progress ?? 0, e.velocity ?? 0);
      });
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    let removeAttentionListeners = () => {};
    const context = gsap.context(() => {
    if (!reduceMotion) {
      gsap.to(".scroll-progress", {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: document.documentElement, start: 0, end: "max", scrub: 0.2 },
      });

      const attentionEl = document.querySelector<HTMLElement>(".attention-model");
      const glowEl      = document.querySelector<HTMLElement>(".attention-glow");
      if (attentionEl && glowEl) {
        const onAttentionMove = (e: MouseEvent) => {
          const rect = attentionEl.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          gsap.to(glowEl, { "--glow-x": `${x.toFixed(1)}%`, "--glow-y": `${y.toFixed(1)}%`, "--glow-opacity": "1", duration: 0.5, ease: "power2.out" });
        };
        const onAttentionLeave = () => gsap.to(glowEl, { "--glow-opacity": "0", duration: 0.7 });
        attentionEl.addEventListener("mousemove", onAttentionMove);
        attentionEl.addEventListener("mouseleave", onAttentionLeave);
        removeAttentionListeners = () => {
          attentionEl.removeEventListener("mousemove", onAttentionMove);
          attentionEl.removeEventListener("mouseleave", onAttentionLeave);
        };
      }

      // Proof gallery
      const proofGallery  = document.getElementById("proof-gallery");
      const proofSlideEls = proofGallery?.querySelectorAll<HTMLElement>(".proof-slide");
      const total         = proofSlideEls?.length ?? 0;
      if (proofGallery && proofSlideEls && total > 0 && !isMobile) {
        let current = 0;
        proofSlideEls.forEach((s, i) => gsap.set(s, { autoAlpha: i === 0 ? 1 : 0, clipPath: "inset(0% 0% 0% 0%)" }));
        const revealCopy = (slide: HTMLElement) => {
          const copy = slide.querySelector(".proof-copy");
          if (copy) gsap.fromTo(copy.children, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.12 });
        };
        proofGallery.dispatchEvent(new Event("perimystic:slide-change"));
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
            outgoing.dataset.active = "false";
            incoming.dataset.active = "true";
            outgoing.inert = true;
            incoming.inert = false;
            outgoing.setAttribute("aria-hidden", "true");
            incoming.removeAttribute("aria-hidden");
            proofGallery.dispatchEvent(new Event("perimystic:slide-change"));
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
        const measureOverflow = () => Math.max(0, cardsTrack.scrollWidth - window.innerWidth);
        if (measureOverflow() > 0) {
          gsap.to(cardsTrack, {
            x: () => -measureOverflow(), ease: "none",
            scrollTrigger: {
              trigger: cardsSection, start: "top top",
              end: () => `+=${measureOverflow()}`,
              pin: true, scrub: 1, anticipatePin: 1,
              invalidateOnRefresh: true, refreshPriority: 2,
            },
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

      // Desktop only: avoid blank entrance frames on touchscreens and tablets.
      if (!isMobile) {
        gsap.from(".cinematic-hero-nav", { autoAlpha: 0, y: -16, duration: .6, ease: "power2.out" });
        gsap.from('.cinematic-slide[data-idx="0"] .cinematic-copy > *', {
          autoAlpha: 0, y: 20, duration: .65, stagger: .09, ease: "power3.out", delay: .05,
        });
      }

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

      // Avoid DOM-mutating SplitType wrappers that break on remount/resizing.
      document.querySelectorAll<HTMLElement>("h2").forEach((el) => {
        if (el.closest(".hero, .proof-slide, .contact")) return;
        gsap.from(el, {
          y: 28, autoAlpha: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      document.querySelectorAll<HTMLElement>(".section-label").forEach((el) => {
        gsap.from(el, { y: 16, opacity: 0, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });

        gsap.utils.toArray<HTMLElement>(".feature-card, .open-proof article").forEach((el) => {
        gsap.from(el, { y: 60, opacity: 0, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
      });

      ScrollTrigger.refresh();
    }
    }, appRef);

    return () => {
      context.revert();
      removeAttentionListeners();
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
      {/* Cinematic grade: vignette + in-palette lens bloom + drifting leak. */}
      <div className="cinema" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <main>
        <ProofSlides />
        <AttentionModel />
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
                    Got a brand that deserves more personality? <em>Tell us what you&apos;re building.</em>
                  </p>
                </div>
              </div>
              <div className="contact-cta contact-console">
                <span className="contact-tick contact-tick--tl" aria-hidden="true" />
                <span className="contact-tick contact-tick--tr" aria-hidden="true" />
                <span className="contact-tick contact-tick--bl" aria-hidden="true" />
                <span className="contact-tick contact-tick--br" aria-hidden="true" />
                <p className="contact-cta-kicker">Your next big idea starts here</p>
                {process.env.NEXT_PUBLIC_PERIMYSTIC_SHEET_FORM_URL ? (
                  <ContactForm />
                ) : (
                  <a className="contact-cta-btn" href={`mailto:${brand.email}?subject=Let's%20talk%20about%20my%20brand`} data-cursor="view">
                    Tell us what you&apos;re building <ArrowRight size={18} />
                  </a>
                )}
                <div className="contact-channels">
                  <a href={`mailto:${brand.email}`} data-cursor="view">
                    <Mail size={15} />{brand.email}
                  </a>
                  <a href={`tel:${brand.phone}`} data-cursor="view">
                    <Phone size={15} />{brand.phoneDisplay}
                  </a>
                  <a href={brand.instagramUrl} target="_blank" rel="noreferrer" data-cursor="view">
                    <AtSign size={15} />{brand.instagram}
                  </a>
                </div>
                <p className="contact-cta-note"><MapPin size={14} aria-hidden="true" /> Available in {brand.serviceArea}</p>
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
            <a href={brand.instagramUrl} target="_blank" rel="noreferrer" data-cursor="view">{brand.instagram}</a>
            <a href={`mailto:${brand.email}`} data-cursor="view">Email us</a>
            <a href={`tel:${brand.phone}`} data-cursor="view">{brand.phoneDisplay}</a>
            <a href="#capabilities" data-cursor="view">Services</a>
            <a href="#contact" data-cursor="view">Get in touch</a>
          </div>
          <p className="footer-loc">Available in {brand.serviceArea} · Creative marketing with a little desi magic.</p>
          <p className="footer-credits">© {new Date().getFullYear()} PERIMYSTIC — Good brands make a scene.</p>
        </div>
      </footer>
    </div>
  );
}
