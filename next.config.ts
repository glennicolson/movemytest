import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * These mirror the policy used on the DTC site so both platforms pass
 * the same browser security checks. The "not a secure connection"
 * browser warning Glen reported was caused by MMT serving responses
 * without these headers (HSTS / X-Frame-Options / X-Content-Type-Options
 * / Referrer-Policy / Permissions-Policy / CSP).
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
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
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
