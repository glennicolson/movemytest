"use client";

import { TrackedLink } from "@/components/marketing/tracked-link";
import { ObfuscatedEmail } from "@/components/marketing/obfuscated-email";

export function CtaBand() {
  return (
    <section className="bg-gradient-to-r from-[var(--brand)] to-[var(--brand-strong)] py-16 text-white">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-3xl font-bold">Take the First Step Today</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-slate-200">
          Whether you&apos;re starting from scratch or picking up where you left off, MoveMyTest will get you test-ready with confidence.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <TrackedLink
            href="/contact"
            location="cta_band"
            trackAs="cta"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-accent)] px-8 py-3 text-base font-semibold !text-white shadow-lg transition hover:bg-red-700 hover:!text-white visited:!text-white"
          >
            Enquire Now
          </TrackedLink>
          <TrackedLink
            href="tel:08000112122"
            location="cta_band"
            className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Call 0800 011 2122
          </TrackedLink>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
          <TrackedLink href="sms:07850907770" location="cta_band" className="font-semibold text-white transition hover:text-[var(--brand-accent)]">Text 07850 907770</TrackedLink>
          <span>&middot;</span>
          <TrackedLink href="https://wa.me/447850907770" target="_blank" rel="noopener noreferrer" location="cta_band" className="font-semibold text-white transition hover:text-[var(--brand-accent)]">WhatsApp</TrackedLink>
          <span>&middot;</span>
          <ObfuscatedEmail location="cta_band" className="font-semibold text-white transition hover:text-[var(--brand-accent)]">Email us</ObfuscatedEmail>
        </div>
      </div>
    </section>
  );
}