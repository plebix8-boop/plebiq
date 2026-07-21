import { ImageResponse } from "next/og";

export const alt = "Plebiq — the world votes here";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#10131f",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div style={{ color: "#a78bfa", display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 5 }}>
          PLEBIQ
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginTop: 28 }}>
          The world votes here.
        </div>
        <div style={{ color: "#cbd5e1", display: "flex", fontSize: 30, marginTop: 28 }}>
          Share your opinion. Discover what people think.
        </div>
      </div>
    ),
    size,
  );
}
