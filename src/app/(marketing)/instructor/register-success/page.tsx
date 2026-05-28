import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Check Your Email — MoveMyTest Instructor",
  description: "Verify your email address to activate your MoveMyTest instructor account.",
  robots: { index: false, follow: false },
};

export default async function MoveMyTestInstructorRegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest Instructor</p>
            <CardTitle>Check your email</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              We have sent a verification email{email ? <> to <strong>{email}</strong></> : ""}.
            </p>
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm leading-6 text-emerald-950">
              <p className="font-semibold">Next steps:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Open the email and click the verification link.</li>
                <li>Your account will be activated and you will be signed in automatically.</li>
                <li>From your instructor dashboard, you can manage learner MoveMyTest listings.</li>
              </ol>
            </div>
            <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-950">
              If you do not see the email within a few minutes, check your spam folder. You can also request a new verification email from the login page.
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/instructor/login" className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-strong)]">
                Go to login
              </Link>
            </div>
          </Card>
        </div>
      </section>
      <section className="flex items-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12 text-slate-900 lg:px-12">
        <div className="mx-auto max-w-lg">
          <p className="mt-4 text-lg font-semibold text-slate-700">Move your driving test without giving away control.</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Registration Complete</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Welcome to MoveMyTest.</h1>
          <p className="mt-4 text-base text-slate-600">
            Verify your email to activate your instructor account and start helping your learners find test swaps safely.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            Verify your email to activate your instructor account and start helping your learners find test swaps safely.for your pupils.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}