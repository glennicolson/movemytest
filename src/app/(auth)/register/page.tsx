import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoveMyTestRegisterForm } from "@/components/movemytest/movemytest-register-form";
import { getPendingLearnerInviteForToken } from "@/features/movemytest/crm-bridge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Your MoveMyTest Account",
  description: "Register for a free MoveMyTest account to save your test details, manage matches and use the official DVSA phone swap process safely.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Create Your MoveMyTest Account",
    description: "Register for a free MoveMyTest account to save your test details, manage matches and use the official DVSA phone swap process safely.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Your MoveMyTest Account",
    description: "Register for a free MoveMyTest account to save your test details, manage matches and use the official DVSA phone swap process safely.",
  },
};

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--brand)]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const swapFeatures = [
  "Create a private test swap listing for your existing practical test",
  "Tell us which dates, times and centres would work better for you",
  "MoveMyTest checks for compatible learner-to-learner matches",
  "Your sensitive licence, theory, address and card details stay out of the form",
  "If both learners agree, you complete the official swap by phone with DVSA",
  "The service is free — no subscription, success fee or premium swap list",
];

export default async function MoveMyTestRegisterPage({ searchParams }: { searchParams: Promise<{ from?: string; invite?: string }> }) {
  const { from, invite } = await searchParams;
  const pendingInvite = await getPendingLearnerInviteForToken(invite);
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest</p>
            <CardTitle>Create your free account</CardTitle>
            <CardDescription>
              Register separately for MoveMyTest so you can save your listing, manage any matches and keep the process secure.
            </CardDescription>
            {invite ? (
              pendingInvite ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-semibold">Instructor invite found</p>
                  <p className="mt-1">Create your MoveMyTest-only account using {pendingInvite.email}. This will link you to your instructor's ADI number for MoveMyTest visibility only.</p>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Invite link not available</p>
                  <p className="mt-1">This invite may already have been used or replaced. You can still register, or ask your instructor to send a fresh invite.</p>
                </div>
              )
            ) : null}
            <MoveMyTestRegisterForm from={from} inviteToken={pendingInvite ? invite : undefined} initialEmail={pendingInvite?.email} />
          </Card>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm font-medium text-slate-500 transition hover:text-zinc-700">Back to MoveMyTest</Link>
          </div>
        </div>
      </section>
      <section className="flex items-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12 text-slate-900 lg:px-12">
        <div className="mx-auto max-w-lg">
          <div className="mb-6">
            <Image
              src="/movemytest-logo.png"
              alt="MoveMyTest"
              width={240}
              height={70}
              priority
              className="h-auto w-[220px]"
            />
          </div>
          <p className="mt-4 text-lg font-semibold text-slate-700">Move your driving test without giving away control.</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Free learner-to-learner matching</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Find a fair swap without paying a reseller.</h1>
          <p className="mt-4 text-base text-slate-600">
            Your MoveMyTest account is separate and focused only on test swaps. It exists only to help you manage swap listings and matches safely.
          </p>
          <ul className="mt-6 space-y-3">
            {swapFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                <CheckIcon />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            MoveMyTest is not DVSA, DVLA, DVA, nidirect or GOV.UK. MoveMyTest helps you find a possible match; learners complete the official swap by phone with DVSA.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}