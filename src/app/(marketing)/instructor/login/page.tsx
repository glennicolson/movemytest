import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoveMyTestInstructorLoginForm } from "@/components/movemytest/movemytest-instructor-login-form";

export const metadata: Metadata = {
  title: "MoveMyTest Instructor Login",
  description: "Instructor sign in for managing MoveMyTest requests linked to an ADI number.",
  robots: { index: false, follow: false },
};

export default async function MoveMyTestInstructorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; verified?: string }>;
}) {
  const { reason, verified } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest Instructor</p>
            <CardTitle>Instructor Sign In</CardTitle>
            <CardDescription>Sign in to view and manage learner test swap listings linked to your ADI number.</CardDescription>

            {reason === "session-expired" && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                Your session has expired. Please sign in again.
              </div>
            )}
            {reason === "email-not-verified" && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                Your email has not been verified yet. Check your inbox for the verification link.
              </div>
            )}
            {verified === "true" && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                Your email has been verified. Please sign in to access your instructor dashboard.
              </div>
            )}

            <div className="mt-6"><MoveMyTestInstructorLoginForm /></div>
          </Card>
          <div className="mt-4 space-y-2 text-center">
            <Link href="/instructor/forgot-password" className="block text-sm font-medium text-slate-500 transition hover:text-zinc-700">Forgot your password? Reset it here</Link>
            <Link href="/instructor/register" className="block text-sm font-medium text-slate-500 transition hover:text-zinc-700">Need an account? Register as a MoveMyTest instructor</Link>
            <Link href="/" className="block text-sm font-medium text-slate-500 transition hover:text-zinc-700">Back to MoveMyTest</Link>
          </div>
        </div>
      </section>
      <section className="flex items-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12 text-slate-900 lg:px-12">
        <div className="mx-auto max-w-lg">
          <p className="mt-4 text-lg font-semibold text-slate-700">Move your driving test without giving away control.</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Private Instructor Access</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Support your learners with test swaps.</h1>
          <p className="mt-4 text-base text-slate-600">
            Sign in to view learner swap requests linked to your ADI number, manage referrals and help learners find compatible test swaps safely.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            Help your learners find compatible test swaps. View swap requests linked to your ADI number and manage referrals safely.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}