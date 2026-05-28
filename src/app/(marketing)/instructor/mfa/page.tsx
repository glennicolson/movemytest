import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MfaChallengeForm } from "@/components/forms/mfa-challenge-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getInstructorMfaChallenge } from "@/features/movemytest/instructor-mfa-session";
import { completeInstructorMfaChallengeAction } from "@/features/movemytest/instructor-mfa-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MoveMyTest Instructor MFA",
  robots: { index: false, follow: false },
};

export default async function InstructorMfaPage() {
  const challenge = await getInstructorMfaChallenge();
  if (!challenge) redirect("/instructor/login?reason=session-expired");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest Instructor</p>
            <CardTitle>Verify {challenge.email}</CardTitle>
            <CardDescription>Enter the 6-digit code from your authenticator app. If you do not have your device, switch to a backup code below.</CardDescription>
            <MfaChallengeForm action={completeInstructorMfaChallengeAction} />
            <p className="mt-4 text-center text-sm text-slate-600"><Link href="/instructor/login" className="font-semibold text-[var(--brand)] underline underline-offset-4">Start sign-in again</Link></p>
          </Card>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm font-medium text-slate-500 transition hover:text-zinc-700">Back to MoveMyTest</Link>
          </div>
        </div>
      </section>
      <section className="flex items-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12 text-slate-900 lg:px-12">
        <div className="mx-auto max-w-lg">
          <p className="mt-4 text-lg font-semibold text-slate-700">Move your driving test without giving away control.</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Extra verification</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">One more step before your instructor dashboard.</h1>
          <p className="mt-4 text-base text-slate-600">
            We recognised your password. Confirm your identity with an authenticator code or backup code to finish signing in.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            Keep your instructor account and learner referrals secure. Confirm your identity to finish signing in.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}