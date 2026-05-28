import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { verifyMoveMyTestInstructorEmailAction } from "@/features/movemytest/instructor-actions";

export const metadata: Metadata = {
  title: "Verify Email — MoveMyTest Instructor",
  description: "Verify your email address to activate your MoveMyTest instructor account.",
  robots: { index: false, follow: false },
};

export default async function MoveMyTestInstructorVerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/instructor/login");
  }

  const result = await verifyMoveMyTestInstructorEmailAction(token);

  if (result.status === "verified") {
    redirect("/instructor/login?verified=true");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest Instructor</p>
            <CardTitle>
              {result.status === "expired" ? "Verification link expired" : "Verification failed"}
            </CardTitle>
            <p className="mt-2 text-sm text-slate-600">{result.message}</p>

            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-6 text-amber-950">
              {result.status === "expired"
                ? "Verification links are valid for 24 hours. You can request a new one from the login page."
                : "If you believe this is an error, contact MoveMyTest support."}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/instructor/login"
                className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-strong)]"
              >
                Go to login
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:border-[var(--brand)]"
              >
                Contact MoveMyTest
              </Link>
            </div>
          </Card>
        </div>
      </section>
      <section className="flex items-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12 text-slate-900 lg:px-12">
        <div className="mx-auto max-w-lg">
          <p className="mt-4 text-lg font-semibold text-slate-700">Move your driving test without giving away control.</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Email Verification</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Almost there.</h1>
          <p className="mt-4 text-base text-slate-600">
            Verify your email to activate your instructor account and start helping your learners find test swaps.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            Verify your email to activate your instructor account and start helping your learners find test swaps safely.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}