import { ImageResponse } from "next/og";

export const alt = "PERIMYSTIC — Good brands make a scene.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div style={{
      width: "100%", height: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#ffd32a", border: "28px solid #db292a", color: "#163cbb",
      fontFamily: "sans-serif", position: "relative",
    }}>
      <div style={{ position: "absolute", top: 22, left: 28, right: 28, display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 900, color: "#db292a" }}>
        <span>✺ DESI BY DESIGN ✺</span><span>CREATIVE / CONTENT / CULTURE</span>
      </div>
      <div style={{ fontSize: 140, fontWeight: 900, letterSpacing: -6, lineHeight: 1, textAlign: "center", textShadow: "7px 7px #f45a96" }}>
        PERIMYSTIC
      </div>
      <div style={{ marginTop: 32, fontSize: 42, fontWeight: 900, color: "#db292a" }}>
        GOOD BRANDS MAKE A SCENE.
      </div>
    </div>, size
  );
}
