import type { NextConfig } from "next";

// El panel no se indexa ni se puede incrustar en otra página.
const PRIVATE_HEADERS = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Sin el globo "N / Issues" de Next en la esquina durante el desarrollo local.
  devIndicators: false,
  async headers() {
    return [
      {
        // El navegador revisa sw.js en cada navegación: así una versión nueva se instala sola.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
      {
        source: "/cuaderno.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      { source: "/admin/:path*", headers: PRIVATE_HEADERS },
      { source: "/api/admin/:path*", headers: PRIVATE_HEADERS },
      {
        source: "/(.*)",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },
};

export default nextConfig;
