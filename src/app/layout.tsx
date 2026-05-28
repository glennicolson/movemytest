import type { Metadata } from "next";
import "@/app/globals.css";
import { SiteHeader } from "@/components/movemytest/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("https://movemytest.co.uk"),
  title: "MoveMyTest",
  description: "Free driving test swap service — find compatible learners to exchange DVSA driving test bookings.",
  icons: {
    icon: [
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
        {/* ── Typekit Fonts ── */}
        <link rel="stylesheet" href="https://use.typekit.net/esr4yrd.css" />
        <link rel="preconnect" href="https://use.typekit.net" />
        <link rel="dns-prefetch" href="https://use.typekit.net" />
      </head>
      <body spellCheck>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
