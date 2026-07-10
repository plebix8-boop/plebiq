"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [logoSrc, setLogoSrc] = useState("/logo.png");

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    const preference = document.documentElement.dataset.theme;
    const isDark =
      preference === "dark" ||
      (preference !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    setLogoSrc(isDark ? "/logo-dark.png" : "/logo.png");
  }, []);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--app-bg)",
          color: "var(--app-fg)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1.25rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow blobs via inline style since Tailwind won't be loaded when layout crashes */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 15% 15%, var(--glow-accent) 0%, transparent 55%), radial-gradient(circle at 85% 85%, var(--info-glow) 0%, transparent 55%)",
          }}
        />

        <div style={{ position: "relative", maxWidth: "26rem" }}>
          <img
            alt="Plebiq"
            src={logoSrc}
            style={{
              display: "block",
              height: "2.25rem",
              width: "auto",
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: "1.25rem",
            }}
          />

          <div
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: "3.5rem",
              height: "3.5rem",
              borderRadius: "1rem",
              border: "1px solid var(--fg-10)",
              background: "var(--fg-5)",
              marginBottom: "1.25rem",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--subtle)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "clamp(1.5rem, 5vw, 2rem)",
              fontWeight: 900,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Critical error
          </h1>
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              color: "var(--muted)",
              maxWidth: "22rem",
            }}
          >
            The application crashed unexpectedly. Reloading usually fixes
            this.
          </p>

          {error.digest && (
            <p
              style={{
                marginTop: "0.75rem",
                fontFamily: "monospace",
                fontSize: "0.7rem",
                color: "var(--fg-20)",
              }}
            >
              {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            type="button"
            style={{
              marginTop: "2rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              height: "3rem",
              padding: "0 1.5rem",
              borderRadius: "1rem",
              background: "var(--app-fg)",
              color: "var(--foreground)",
              fontSize: "0.875rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 18px 50px var(--fg-12)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
            }
          >
            Reload app
          </button>
        </div>
      </body>
    </html>
  );
}
