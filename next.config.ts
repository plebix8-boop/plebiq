import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

function getSecurityHeaders() {
  const connectSrc = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://va.vercel-scripts.com",
    ...(isDev
      ? [
          "ws://localhost:3000",
          "ws://127.0.0.1:3000",
          "ws://192.168.0.109:3000",
          "https://*.ngrok-free.app",
          "wss://*.ngrok-free.app",
        ]
      : []),
  ].join(" ");

  return [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      `connect-src ${connectSrc}`,
      "frame-ancestors 'none'",
    ].join("; "),
  },
  ];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.109", "*.ngrok-free.app"],
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders(),
      },
    ];
  },
};

export default nextConfig;
