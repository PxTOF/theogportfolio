"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useScrollStore } from "./store";

function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ─── Deep-space starfield + red nebula confined to the hero rect ──────────────

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uVelocity;
  uniform vec2  uMouse;
  uniform float uAspect;
  uniform float uScroll;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float hash1(float n) { return fract(sin(n) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i),            hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.08; a *= 0.49; }
    return v;
  }

  // A star at each grid cell — twinkles and has a subtle spike glow
  float star(vec2 uv, float scale, float minBright) {
    vec2 sUv  = uv * scale;
    vec2 id   = floor(sUv);
    vec2 fr   = fract(sUv) - 0.5;
    float r   = hash(id);
    if (r < minBright) return 0.0;
    float d   = length(fr);
    float b   = smoothstep(0.055, 0.0, d);
    // 4-point diffraction spike
    float spk = max(exp(-abs(fr.x) * 28.0) * exp(-fr.y * fr.y * 70.0),
                    exp(-abs(fr.y) * 28.0) * exp(-fr.x * fr.x * 70.0)) * 0.5;
    float twinkle = 0.65 + 0.35 * sin(uTime * (2.5 + r * 4.0) + r * 80.0);
    return (b + spk) * twinkle;
  }

  void main() {
    vec2 uv = vUv;
    uv.y += uScroll * 0.07;            // parallax drift as the hero scrolls away
    vec2 p  = (uv - 0.5); p.x *= uAspect;
    p *= 1.0 - uScroll * 0.06;         // subtle camera push-in
    float t = uTime;

    // ── Starfield layers (different scales + densities) ──────────────────────
    float s1 = star(uv, 55.0,  0.965) * 1.0;
    float s2 = star(uv, 110.0, 0.975) * 0.75;
    float s3 = star(uv, 220.0, 0.982) * 0.55;
    float s4 = star(uv, 380.0, 0.988) * 0.4;
    float allStars = s1 + s2 + s3 + s4;

    // ── Red nebula cloud ──────────────────────────────────────────────────────
    float nt = t * 0.011;
    vec2 q = vec2(fbm(p * 1.1 + nt), fbm(p * 1.1 - nt * 0.8 + 5.3));
    float neb = fbm(p * 2.2 + q * 1.9) * 0.42;
    // Fade nebula toward edges
    neb *= 1.0 - smoothstep(0.22, 0.7, length(p));

    // ── Galaxy dust (large-scale, very faint) ─────────────────────────────────
    float dust = noise(p * 3.5 + t * 0.006) * noise(p * 6.0 - t * 0.009) * 0.18;
    dust *= 1.0 - smoothstep(0.28, 0.75, length(p));

    // ── Cursor-reactive red glow behind the logo ──────────────────────────────
    vec2 c  = vec2(uMouse.x * 0.1, 0.03 + uMouse.y * 0.07);
    float d = length((uv - 0.5 - c) * vec2(uAspect, 1.0));
    float glow = smoothstep(0.62, 0.0, d);
    float velBoost = 1.0 + abs(uVelocity) * 0.012;

    // ── Compose ───────────────────────────────────────────────────────────────
    vec3 space = vec3(0.008, 0.003, 0.003);
    vec3 col   = space;

    // Nebula: deep blood-red cloud (kept restrained so the logo reads)
    col += vec3(0.46, 0.018, 0.010) * neb;
    col += vec3(0.30, 0.006, 0.004) * dust;

    // Dark well right behind the wordmark so star-particles pop against it
    float well = smoothstep(0.34, 0.0, length(p * vec2(0.78, 1.25)));
    col *= 1.0 - well * 0.55;

    // Stars: bright white with very slight warm/cool tint per layer
    col += vec3(0.92, 0.92, 0.97) * s1;
    col += vec3(0.82, 0.82, 0.90) * s2;
    col += vec3(0.70, 0.72, 0.80) * (s3 + s4);

    // Red logo-centre glow (softer; sits behind the wordmark)
    col += vec3(0.85, 0.05, 0.02) * glow * (0.14 + 0.16 * neb) * velBoost;

    // Edge vignette
    col *= 1.0 - smoothstep(0.42, 0.96, length(p));

    // Recede into the dark as the hero scrolls away (depth)
    col *= 1.0 - uScroll * 0.5;

    // Subtle grain
    col += hash(uv * 1400.0 + t * 0.08) * 0.016 - 0.008;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }
`;

function trackToHero(
  mesh: THREE.Object3D | null,
  camera: THREE.Camera,
  size: { width: number; height: number },
  cover: boolean
) {
  const el = document.querySelector(".hero") as HTMLElement | null;
  if (!el || !mesh) return null;
  const r = el.getBoundingClientRect();
  const persp = camera as THREE.PerspectiveCamera;
  const visH = 2 * Math.tan(((persp.fov * Math.PI) / 180) / 2) * persp.position.z;
  const wpp = visH / size.height;
  mesh.position.x = (r.left + r.width / 2 - size.width / 2) * wpp;
  mesh.position.y = -(r.top + r.height / 2 - size.height / 2) * wpp;
  if (cover) {
    mesh.scale.x = r.width * wpp * 1.08;
    mesh.scale.y = r.height * wpp * 1.08;
  }
  mesh.visible = r.bottom > -60 && r.top < size.height + 60;
  return r;
}

export function HeroBackground() {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const { camera, size } = useThree();

  useFrame((state, dt) => {
    const r = trackToHero(mesh.current, camera, size, true);
    const uniforms = material.current?.uniforms;
    if (!r || !uniforms) return;
    uniforms.uTime.value     += dt;
    uniforms.uVelocity.value  = useScrollStore.getState().velocity;
    uniforms.uMouse.value.set(state.pointer.x, state.pointer.y);
    uniforms.uAspect.value    = r.width / r.height || 1;
    // 0 at the top, → 1 as the hero scrolls up out of view (drives the drift).
    uniforms.uScroll.value    = Math.min(1, Math.max(0, -r.top / size.height));
  });

  return (
    <mesh ref={mesh} position-z={-0.6} renderOrder={-2}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{
          uTime:     { value: 0 },
          uVelocity: { value: 0 },
          uMouse:    { value: new THREE.Vector2() },
          uAspect:   { value: 1 },
          uScroll:   { value: 0 },
        }}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Ambient deep-space particle field (parallax with cursor) ─────────────────

export function HeroParticles() {
  const group  = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const { camera, size } = useThree();

  const { geometry } = useMemo(() => {
    const n    = 1200;
    const pos  = new Float32Array(n * 3);
    const col  = new Float32Array(n * 3);
    const sz   = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r1 = seededUnit(i + 1);
      const r2 = seededUnit(i + 101);
      const r3 = seededUnit(i + 211);
      const r4 = seededUnit(i + 307);
      const r5 = seededUnit(i + 401);
      pos[i * 3]     = (r1 - 0.5) * 10;
      pos[i * 3 + 1] = (r2 - 0.5) * 6;
      pos[i * 3 + 2] = (r3 - 0.5) * 5 - 0.3;
      const isRed = r4 < 0.06;
      const b = 0.55 + r5 * 0.45;
      col[i * 3]     = isRed ? 0.92 : b;
      col[i * 3 + 1] = isRed ? 0.08 : b;
      col[i * 3 + 2] = isRed ? 0.04 : b;
      sz[i] = isRed ? 0.025 : 0.008 + seededUnit(i + 509) * 0.015;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    g.setAttribute("size",     new THREE.BufferAttribute(sz, 1));
    return { geometry: g };
  }, []);

  useFrame((state, dt) => {
    const r = trackToHero(group.current, camera, size, false);
    if (group.current) {
      group.current.rotation.y = state.pointer.x * 0.14;
      group.current.rotation.x = -state.pointer.y * 0.09;
      // Dust drifts up faster than the nebula plane → depth parallax on scroll.
      if (r) group.current.position.y += Math.min(1, Math.max(0, -r.top / size.height)) * 1.3;
    }
    if (points.current) points.current.rotation.z += dt * 0.009;
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} renderOrder={-1}>
        <pointsMaterial
          size={0.018}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
