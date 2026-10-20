import { ImageResponse } from "next/og";

export const alt = "Samuel Tsao — Software engineering, systems, and applied ML";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function SocialImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#f7f6f2",
        color: "#172c2b",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div style={{ fontSize: 25, marginBottom: 42 }}>SAMUEL TSAO / SOFTWARE ENGINEER</div>
      <div style={{ fontSize: 86, letterSpacing: -4 }}>Reliable systems.</div>
      <div style={{ fontSize: 86, letterSpacing: -4, color: "#336a60" }}>
        Thoughtful intelligence.
      </div>
      <div style={{ fontSize: 24, marginTop: 42 }}>Systems · Infrastructure · Applied ML</div>
    </div>,
    size,
  );
}
