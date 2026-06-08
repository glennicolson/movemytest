"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/start", label: "Start Listing" },
  { href: "/test-centres", label: "Test Centres" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/instructor", label: "For Instructors" },
  { href: "/support-us", label: "Support Us" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-10 w-[140px] sm:h-12 sm:w-[160px]">
            <Image
              src="/movemytest-logo.png"
              alt="MoveMyTest"
              fill
              // Logo is the LCP element above the fold; mark it priority so
              // Next.js preloads it (improves LCP metric). `fill` mode makes
              // the image scale to its parent div; the parent is sized by
              // Tailwind classes so no inline style override is needed.
              priority
              sizes="(min-width: 640px) 160px, 140px"
              className="object-contain"
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[var(--brand)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Sign In
          </Link>
          <Link
            href="/start"
            className="rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[var(--brand-strong)]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[var(--brand)]"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                Sign In
              </Link>
              <Link
                href="/start"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-[var(--brand)] px-4 py-2 text-center text-sm font-semibold !text-white transition hover:bg-[var(--brand-strong)]"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
