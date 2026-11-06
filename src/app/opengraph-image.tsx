import { ImageResponse } from "next/og";

export const alt = "Perimystic Marketing Agency — Insight, Strategy, Impact.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Restrained print-style share card, not an imitation of the official logo.
export default function OpengraphImage() {
  return new ImageResponse(
    <div style={{
      display: "flex", flexDirection: "column", justifyContent: "center",
      width: "100%", height: "100%", background: "#f0dfba",
      padding: "64px", color: "#193f33", fontFamily: "serif",
    }}>
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        alignItems: "center", width: "100%", height: "100%",
        border: "7px double #a84324", position: "relative",
      }}>
        <div style={{ display: "flex", fontSize: 21, letterSpacing: 6, color: "#9a4327" }}>
          CREATIVE MARKETING AGENCY
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 122, fontWeight: 700, lineHeight: 1.1, color: "#a64021" }}>
          Perimystic
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 31, color: "#21493d" }}>
          Good brands don't whisper. They make a scene.
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 20, letterSpacing: 8, color: "#446658" }}>
          INSIGHT  ◆  STRATEGY  ◆  IMPACT
        </div>
      </div>
    </div>, size
  );
}
