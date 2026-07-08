import { ImageResponse } from "next/og";

export const alt = "Revilo — Design System Alignment Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#F8F7F4",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Top label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399" }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: "#706F6A", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Design System Intelligence
          </span>
        </div>

        {/* Headline */}
        <div style={{ fontSize: 68, fontWeight: 700, color: "#1C1C1A", lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 28 }}>
          Stop guessing where your{" "}
          <span style={{ color: "#7C3AED" }}>design system drifted.</span>
        </div>

        {/* Subline */}
        <div style={{ fontSize: 22, color: "#706F6A", fontWeight: 400, lineHeight: 1.5, maxWidth: 700 }}>
          Revilo scans your Figma library against your codebase and shows you exactly where they've diverged.
        </div>

        {/* Score pills */}
        <div style={{ display: "flex", gap: 12, marginTop: 56 }}>
          {[
            { label: "Alignment", score: 82, color: "#7C3AED" },
            { label: "Adoption", score: 71, color: "#60A5FA" },
            { label: "Architecture", score: 90, color: "#34D399" },
          ].map(({ label, score, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: "1px solid rgba(28,28,26,0.1)",
                borderRadius: 16,
                padding: "12px 20px",
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color }}>{score}</div>
              <div style={{ fontSize: 13, color: "#706F6A", fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Brand */}
        <div style={{ position: "absolute", bottom: 56, right: 96, fontSize: 18, fontWeight: 700, color: "#1C1C1A", letterSpacing: "-0.02em" }}>
          revilo.design
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
