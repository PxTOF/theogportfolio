"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, type RefObject } from "react";
import { HeroBackground, HeroParticles } from "./HeroBackground";
import Effects from "./Effects";

// The authentic Perimystic artwork belongs in the DOM so its illustration and
// Hindi lettering stay crisp and accessible. WebGL supplies atmosphere only.
// The former particle wordmark recreated the logo in Impact and is retired.
export default function Scene({ eventSource }: { eventSource: RefObject<HTMLElement | null> }) {
  const [mobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 900px), (pointer: coarse)").matches
  );

  return (
    <div className="webgl-layer" aria-hidden="true">
      <Canvas
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"
        dpr={mobile ? [1, 1.25] : [1, 1.5]}
        gl={{ antialias: !mobile, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 6], fov: 40 }}
      >
        <Suspense fallback={null}>
          <HeroBackground />
          {!mobile && <HeroParticles />}
          {!mobile && <Effects />}
        </Suspense>
      </Canvas>
    </div>
  );
}
