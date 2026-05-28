"use client";

import Link from "next/link";
import { TrackedLink } from "@/components/marketing/tracked-link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--brand-strong)] to-[var(--brand)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,29,67,0.15),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          Start Your Driving Journey
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200 md:text-xl">
          Friendly DVSA-approved instructors for manual and automatic lessons across Edinburgh, the Lothians, Livingston, Fife and Dumfries.
        </p>
        <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-2 text-xs font-semibold text-white/90 sm:text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1.5">DVSA-approved</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">Manual & automatic</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">WhatsApp friendly</span>
        </div>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <TrackedLink
            href="/contact"
            location="hero"
            trackAs="cta"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--brand-accent)] px-6 py-3 text-base font-semibold !text-white shadow-lg transition hover:bg-red-700 hover:!text-white visited:!text-white"
          >
            Book your first lesson
          </TrackedLink>
          <TrackedLink
            href="https://wa.me/447850907770"
            target="_blank"
            rel="noopener noreferrer"
            location="hero"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Message us on WhatsApp
          </TrackedLink>
        </div>
        <div className="mx-auto mt-4 flex max-w-xl items-center justify-center gap-3 text-sm text-white/80">
          <Link href="/prices" className="underline decoration-white/30 underline-offset-4 hover:text-white">See prices</Link>
          <span aria-hidden="true">•</span>
          <Link href="/reviews" className="underline decoration-white/30 underline-offset-4 hover:text-white">Read learner reviews</Link>
        </div>
        <div className="mt-8 hidden md:mx-auto md:flex md:max-w-2xl md:flex-col md:items-center md:gap-3 md:rounded-2xl md:bg-[var(--brand)] md:p-4 md:text-center lg:flex-row lg:justify-center lg:gap-6">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white">Also recruiting instructors</div>
            <div className="mt-1 text-sm text-white/80">Join MoveMyTest as an ADI or ask about trainee pathways.</div>
          </div>
          <TrackedLink
            href="/become-an-instructor"
            location="hero"
            trackAs="cta"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-accent)] px-6 py-3 text-base font-semibold !text-white shadow-lg transition hover:bg-red-700 hover:!text-white visited:!text-white"
          >
            Become a MoveMyTest Instructor
          </TrackedLink>
        </div>
        <div className="mt-8 hidden gap-6 sm:grid-cols-3 md:grid">
          <TrackedLink href="tel:08000112122" location="hero" className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm transition hover:bg-white/20">
            <div className="text-2xl font-bold">0800 011 2122</div>
            <div className="mt-1 text-sm text-slate-300">Tap to call</div>
          </TrackedLink>
          <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold">07850 907770</div>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-semibold">
              <TrackedLink href="sms:07850907770" location="hero" className="rounded-full bg-white/15 px-3 py-1.5 transition hover:bg-white/25">Text</TrackedLink>
              <TrackedLink href="https://wa.me/447850907770" target="_blank" rel="noopener noreferrer" location="hero" className="rounded-full bg-white/15 px-3 py-1.5 transition hover:bg-white/25">WhatsApp</TrackedLink>
              <TrackedLink href="tel:07850907770" location="hero" className="rounded-full bg-white/15 px-3 py-1.5 transition hover:bg-white/25">Call</TrackedLink>
            </div>
          </div>
          <TrackedLink href="tel:01315554134" location="hero" className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm transition hover:bg-white/20">
            <div className="text-2xl font-bold">0131 555 4134</div>
            <div className="mt-1 text-sm text-slate-300">Tap to call</div>
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}