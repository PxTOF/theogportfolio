"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useDomSync } from "./track";
import { HeroBackground, HeroParticles } from "./HeroBackground";
import { drawSnagLogo, SNAG_LOGO_VIEWBOX } from "@/lib/logo";
import Effects from "./Effects";

// ─── SNAG logo rendered as an ink/star particle cloud ─────────────────────────
// The real Snag wordmark is rasterised to an offscreen canvas, its opaque pixels
// are sampled into a thin 3D slab of star-particles, and the cloud rests as the
// legible wordmark, scattering away from the cursor then springing back.
// (Sampling text — not the GLB — guarantees crisp, readable letterforms.)

type LogoData = { geometry: THREE.BufferGeometry; origPos: Float32Array; half: { x: number; y: number } };

// Reused each frame to project the screen pointer onto the wordmark's plane.
const _ray = new THREE.Vector3();
const _hit = new THREE.Vector3();

function buildSnagGeometry(maxParticles = 4200): LogoData | null {
  const Wc = 1024;
  const Hc = Math.round((Wc * SNAG_LOGO_VIEWBOX.h) / SNAG_LOGO_VIEWBOX.w);
  const canvas = document.createElement("canvas");
  canvas.width = Wc; canvas.height = Hc;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Rasterise the real Snag wordmark so the particles form the actual logo.
  drawSnagLogo(ctx, Wc, Hc, { widthFrac: 0.96, color: "#ffffff" });

  const data = ctx.getImageData(0, 0, Wc, Hc).data;
  const pts: [number, number][] = [];
  const step = 3;
  for (let y = 0; y < Hc; y += step)
    for (let x = 0; x < Wc; x += step)
      if (data[(y * Wc + x) * 4 + 3] > 128) pts.push([x, y]);
  if (pts.length === 0) return null;

  // Fisher–Yates shuffle so the capped subset is spread evenly across letters.
  for (let i = pts.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  const N = Math.min(maxParticles, pts.length);
  const aspect = Hc / Wc;

  const positions = new Float32Array(N * 3);
  const origPos   = new Float32Array(N * 3);
  const colors    = new Float32Array(N * 3);
  const sizes     = new Float32Array(N);
  const randoms   = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const [pxv, pyv] = pts[i];
    // Local space ~1 unit wide so useDomSync (base:1) fits it to the hero rect.
    const lx = (pxv / Wc - 0.5) * 1.0;
    const ly = -(pyv / Hc - 0.5) * aspect;
    const lz = (Math.random() - 0.5) * 0.05; // thin slab → keeps letters crisp
    origPos[i * 3] = lx; origPos[i * 3 + 1] = ly; origPos[i * 3 + 2] = lz;

    // Start gently scattered so the wordmark "breathes" into focus on first paint
    // (the preloader already performs the big particle assembly).
    positions[i * 3]     = lx + (Math.random() - 0.5) * 0.18;
    positions[i * 3 + 1] = ly + (Math.random() - 0.5) * 0.18;
    positions[i * 3 + 2] = lz + (Math.random() - 0.5) * 0.12;

    const isRed    = Math.random() < 0.09;
    const isPulsar = !isRed && Math.random() < 0.05;
    if (isRed) {
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.14; colors[i * 3 + 2] = 0.10;
      sizes[i] = 0.050;
    } else if (isPulsar) {
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0;
      sizes[i] = 0.066;
    } else {
      const b = 0.82 + Math.random() * 0.18;
      colors[i * 3] = b; colors[i * 3 + 1] = b; colors[i * 3 + 2] = b;
      sizes[i] = 0.030 + Math.random() * 0.018;
    }
    randoms[i] = Math.random();
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("aColor",   new THREE.BufferAttribute(colors, 3));
  g.setAttribute("aSize",    new THREE.BufferAttribute(sizes, 1));
  g.setAttribute("aRandom",  new THREE.BufferAttribute(randoms, 1));
  g.computeBoundingSphere();

  // Real half-extents (the rasterised word doesn't fill the canvas) so the
  // cursor-repulsion radius lines up with the actual letters.
  let minX = 9, maxX = -9, minY = 9, maxY = -9;
  for (let i = 0; i < N; i++) {
    const a = origPos[i * 3], b = origPos[i * 3 + 1];
    if (a < minX) minX = a; if (a > maxX) maxX = a;
    if (b < minY) minY = b; if (b > maxY) maxY = b;
  }
  const half = { x: Math.max(0.1, (maxX - minX) / 2), y: Math.max(0.05, (maxY - minY) / 2) };

  return { geometry: g, origPos, half };
}

const PARTICLE_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;
  attribute float aRandom;
  varying   vec3  vColor;
  varying   float vAlpha;
  uniform   float uTime;
  uniform   float uPixelRatio;
  uniform   float uScale;

  void main() {
    vColor = aColor;

    vec3 pos = position;
    // Per-particle subtle float drift
    pos.y += sin(uTime * 0.58 + aRandom * 6.28) * 0.005;
    pos.x += cos(uTime * 0.44 + aRandom * 4.71) * 0.004;
    pos.z += sin(uTime * 0.33 + aRandom * 3.14) * 0.003;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    // Size in CSS px (× pixelRatio → device px). uScale keeps the wordmark
    // legible no matter how the group is fitted to the hero rect.
    gl_PointSize = aSize * uScale * uPixelRatio * 900.0 / -mvPos.z;
    gl_Position  = projectionMatrix * mvPos;

    // Breathing alpha — never fully transparent so the wordmark holds
    vAlpha = 0.62 + 0.38 * sin(uTime * 1.05 + aRandom * 5.8);
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float r  = length(uv);

    // Solid disc
    float disc = 1.0 - smoothstep(0.32, 0.50, r);

    // 4-point star diffraction spikes
    float spikes = max(
      exp(-abs(uv.x) * 24.0) * exp(-uv.y * uv.y * 58.0),
      exp(-abs(uv.y) * 24.0) * exp(-uv.x * uv.x * 58.0)
    ) * 0.65;

    // Soft halo glow
    float glow = smoothstep(0.50, 0.0, r) * 0.30;

    float alpha = (disc + spikes + glow) * vAlpha;
    if (alpha < 0.006) discard;

    gl_FragColor = vec4(vColor, alpha);
  }
`;

function HeroParticleLogo({ maxParticles = 4200 }: { maxParticles?: number }) {
  const group     = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // origPosRef: rest positions (never changed after init)
  const origPosRef   = useRef<Float32Array | null>(null);
  // halfSizeRef: geometry half-extents for mouse ↔ local-space mapping
  const halfSizeRef  = useRef({ x: 0.5, y: 0.18 });
  // stirRef: movement "energy" that rises as the cursor moves and decays when
  // still, so the wordmark only scatters when you actively sweep through it and
  // re-forms to a clean SNAG at rest (also avoids the resting-centre blowout).
  const stirRef      = useRef(0);
  const lastPointer  = useRef(new THREE.Vector2(0, 0));

  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Build the wordmark once fonts are ready (Bebas Neue must be loaded so the
  // sampled glyphs are correct). Timeout guards against fonts never resolving.
  useEffect(() => {
    let cancelled = false;
    let built: LogoData | null = null;
    const make = async () => {
      try {
        await Promise.race([document.fonts.ready, new Promise<void>((r) => setTimeout(r, 800))]);
      } catch { /* ignore */ }
      if (cancelled) return;
      built = buildSnagGeometry(maxParticles);
      if (!built || cancelled) return;
      origPosRef.current  = built.origPos;
      halfSizeRef.current = built.half;
      setGeometry(built.geometry);
    };
    make();
    return () => {
      cancelled = true;
      built?.geometry.dispose();
    };
  }, []);

  useDomSync(".hero-view", group, { scaleMode: "width", base: 1, pad: 0.8 });

  useFrame((state, dt) => {
    if (!pointsRef.current || !group.current) return;
    const orig = origPosRef.current;
    if (!orig) return;

    const uniforms = materialRef.current?.uniforms;
    if (!uniforms) return;
    uniforms.uTime.value       = state.clock.elapsedTime;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    // Particle size tracks the group's fit-scale (normalised to a desktop
    // reference) so the dots stay proportional to the wordmark at any viewport.
    uniforms.uScale.value      = (group.current.scale.x || 3.9) / 3.9;

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const pos     = posAttr.array as Float32Array;
    const N       = pos.length / 3;

    // Movement energy: rises with cursor speed, decays when still.
    const px = state.pointer.x, py = state.pointer.y;
    const moveDist = Math.hypot(px - lastPointer.current.x, py - lastPointer.current.y);
    lastPointer.current.set(px, py);
    stirRef.current = Math.max(stirRef.current * 0.90, Math.min(1, moveDist * 16));
    const stir = stirRef.current;

    // Project the screen pointer onto the wordmark's local plane so dispersion
    // tracks the real cursor at any viewport/scale (ray → z=0 plane → local).
    group.current.updateMatrixWorld();
    _ray.set(px, py, 0.5).unproject(state.camera).sub(state.camera.position).normalize();
    const tHit = (group.current.position.z - state.camera.position.z) / _ray.z;
    _hit.copy(state.camera.position).addScaledVector(_ray, tHit);
    group.current.worldToLocal(_hit);
    const mx = _hit.x, my = _hit.y;

    const hx = halfSizeRef.current.x;
    const active        = stir > 0.015;       // only scatter while actively stirring
    const SPRING        = 0.06;
    const REPULSE_R     = hx * 0.9;            // radius in geometry units
    const REPULSE_STR   = hx * 1.15 * stir;   // strength scales with movement

    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      let x = pos[i3], y = pos[i3 + 1], z = pos[i3 + 2];
      const ox = orig[i3], oy = orig[i3 + 1], oz = orig[i3 + 2];

      // Spring back to rest
      x += (ox - x) * SPRING;
      y += (oy - y) * SPRING;
      z += (oz - z) * SPRING * 0.6;

      // Mouse repulsion in local XY (only once the pointer has really moved)
      const dx   = x - mx;
      const dy   = y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (active && dist < REPULSE_R && dist > 0.0001) {
        const f = ((REPULSE_R - dist) / REPULSE_R) * REPULSE_STR;
        x += (dx / dist) * f;
        y += (dy / dist) * f;
        z += Math.sin((i + 1) * 31.7 + state.clock.elapsedTime) * f * 0.15; // subtle Z scatter on repulsion
      }

      pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;
    }
    posAttr.needsUpdate = true;

    // Gentle cursor-lean rotation
    const g = group.current;
    g.rotation.y += (state.pointer.x * 0.28 - g.rotation.y) * Math.min(1, dt * 2.8);
    g.rotation.x += (-state.pointer.y * 0.16 - g.rotation.x) * Math.min(1, dt * 2.8);
  });

  return (
    <group ref={group}>
      {geometry && (
        <points ref={pointsRef} geometry={geometry}>
          <shaderMaterial
            ref={materialRef}
            vertexShader={PARTICLE_VERT}
            fragmentShader={PARTICLE_FRAG}
            uniforms={{ uTime: { value: 0 }, uPixelRatio: { value: 1.5 }, uScale: { value: 1 } }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

export default function Scene({ eventSource }: { eventSource: RefObject<HTMLElement | null> }) {
  // Lighter render on phones/tablets: lower DPR, fewer particles, no antialias,
  // and skip the heavy bloom/chromatic post-processing — keeps the nebula +
  // particle wordmark (the "life") without the GPU cost that caused the jank.
  const [mobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 900px), (pointer: coarse)").matches
  );

  useEffect(() => {
    const t = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="webgl-layer">
      <Canvas
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"
        dpr={mobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 6], fov: 40 }}
        onCreated={(state) => state.setSize(window.innerWidth, window.innerHeight)}
      >
        <HeroBackground />
        <HeroParticles />
        <Suspense fallback={null}>
          <HeroParticleLogo maxParticles={mobile ? 1800 : 4200} />
          <Preload all />
        </Suspense>
        {!mobile && <Effects />}
      </Canvas>
    </div>
  );
}
