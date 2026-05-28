"use client";

import Link from "next/link";
import { ArrowRight, CalendarSync, ShieldCheck, UsersRound } from "lucide-react";
import { TrackedLink } from "@/components/marketing/tracked-link";

export function MoveMyTestHomeBanner() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
        {/* Decorative background element */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--brand)]/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              <CalendarSync className="h-3.5 w-3.5" />
              New — Free forever
            </div>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              Need to swap your driving test date?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
              MoveMyTest helps you find another learner who wants your exact practical test slot — 
              and vice versa. No fees, no subscription. Just a safe, private match and the official DVSA swap by phone.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Learner-to-learner only
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UsersRound className="h-3.5 w-3.5 text-emerald-400" />
                No personal details shared publicly
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <TrackedLink
              href="/"
              location="home-movemytest-banner"
              trackAs="cta"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
            >
              Try MoveMyTest
              <ArrowRight className="h-4 w-4" />
            </TrackedLink>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              How it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
