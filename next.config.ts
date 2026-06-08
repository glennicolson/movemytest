import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Default Next.js build output (a regular `.next/` directory).
  // Was previously `output: "standalone"` but that produced `.next/standalone/`
  // which Hostinger's Node app runner doesn't pick up. The 22 May lighttpd
  // cache issue was traced back to this mismatch — see
  // wiki/reviews/2026-06-02-end-to-end-review.md.
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    // Dev mode requires `'unsafe-eval'` for the react-refresh-utils hot-reload
    // shim, and we need to allow https://use.typekit.net so the Adobe Fonts
    // stylesheet can load. Both are dev-only relaxations; the prod policy
    // stays strict. Detected via NODE_ENV at request time.
    //
    // IMPORTANT: The shared `cspBase` array is used in BOTH dev and prod so
    // that the only difference is the dev relaxations (`'unsafe-eval'`, the
    // ws:/wss: HMR channel). If a service needs to be reachable on prod, it
    // must be allowed in `cspBase`, not the dev branch — silently blocking
    // GA / Typekit in prod is a marketing analytics time-bomb.
    const cspBase = {
      "default-src": "'self'",
      "img-src": "'self' data: https:",
      // Typekit loads the stylesheet from use.typekit.net and the actual
      // font files (woff2) from p.typekit.net. Both subdomains must be
      // allowed here.
      "style-src": "'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net",
      "font-src": "'self' data: https://use.typekit.net https://p.typekit.net",
      // Google Analytics 4 (gtag.js) loads from googletagmanager.com and
      // beacons back to www.google-analytics.com. Both must be allowed.
      "script-src": "'self' 'unsafe-inline' https://www.googletagmanager.com",
      "connect-src": "'self' https: https://www.google-analytics.com",
      "frame-ancestors": "'none'",
    };
    // Dev branch: replace (not append) the values that need relaxation.
    // Appending the same directive twice would leave the browser honouring
    // only the first one, losing the dev relaxations.
    const cspDevDirectives = {
      ...cspBase,
      "script-src": "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "connect-src": "'self' https: ws: wss: https://www.google-analytics.com",
    };
    const cspDirectives = isDev ? cspDevDirectives : cspBase;
    const csp = Object.entries(cspDirectives)
      .map(([key, value]) => `${key} ${value}`)
      .join("; ");

    // The dev branch carries the same transport / framing protections as
    // prod; only the CSP differs (with `'unsafe-eval'` and ws:/wss: for HMR).
    // HSTS is skipped in dev because the dev server runs over plain HTTP.
    const headers = isDev
      ? [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ]
      : [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ];

    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default nextConfig;
