import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteHeader } from "@/components/movemytest/site-header";
import { SiteFooter } from "@/components/movemytest/site-footer";
import { CookieConsentBanner } from "@/components/movemytest/cookie-consent";

export const metadata: Metadata = {
  metadataBase: new URL("https://movemytest.co.uk"),
  title: "MoveMyTest",
  description: "Free driving test swap service — find compatible learners to exchange DVSA driving test bookings.",
  alternates: {
    canonical: "https://movemytest.co.uk",
    languages: {
      "en-GB": "https://movemytest.co.uk",
    },
  },
  icons: {
    icon: [
      // All favicon sizes generated from /Volumes/Data-1/Movemytest/Fav.png
      // (254x229 RGBA). Order matters: modern browsers pick the largest match.
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" spellCheck>
      <head>
        <meta name="google-site-verification" content="wMUbDQPZPJ3qknNTL4j1RrPaqf_F9u1e_vU0zFxndpE" />
        {/* ── Typekit Fonts ── */}
        <link rel="stylesheet" href="https://use.typekit.net/esr4yrd.css" />
        <link rel="preconnect" href="https://use.typekit.net" />
        <link rel="dns-prefetch" href="https://use.typekit.net" />
      </head>
      <body spellCheck>
        <SiteHeader />
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
