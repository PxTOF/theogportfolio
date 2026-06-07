import { ImageResponse } from "next/og";

// Branded social-share card (generated, no asset needed).
export const alt = "SNAG — We make people care.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 42%, #2a0707 0%, #050505 62%, #000 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 260,
            fontWeight: 900,
            color: "#e8271e",
            letterSpacing: -8,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          Snag
        </div>
        <div
          style={{
            fontSize: 46,
            marginTop: 10,
            color: "#f2f2f2",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          We make people care.
        </div>
        <div
          style={{
            fontSize: 22,
            marginTop: 26,
            color: "rgba(242,242,242,0.55)",
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Creative &amp; Content Studio · Gurgaon
        </div>
      </div>
    ),
    { ...size }
  );
}
