import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PasswordResetEmailRequestForm } from "@/components/forms/password-reset-email-request-form";
import { requestMoveMyTestInstructorPasswordResetAction } from "@/features/movemytest/instructor-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset MoveMyTest Instructor Password",
  description: "Request a password reset link for your MoveMyTest instructor account.",
  robots: { index: false, follow: false },
};

export default function MoveMyTestInstructorForgotPasswordPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest Instructor</p>
            <CardTitle>Reset Instructor Password</CardTitle>
            <CardDescription>
              Enter the email linked to your MoveMyTest instructor account. We will send a reset link if an active instructor account exists.
            </CardDescription>
            <PasswordResetEmailRequestForm
              action={requestMoveMyTestInstructorPasswordResetAction}
              title="ts-instructor-reset"
              helper="Use the email address linked to your MoveMyTest instructor account."
              submitLabel="Email reset link"
            />
          </Card>
          <div className="mt-4 text-center">
            <Link href="/instructor/login" className="text-sm font-medium text-slate-500 transition hover:text-zinc-700">Back to instructor sign in</Link>
          </div>
        </div>
      </section>
      <section className="flex items-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12 text-slate-900 lg:px-12">
        <div className="mx-auto max-w-lg">
          <p className="mt-4 text-lg font-semibold text-slate-700">Move your driving test without giving away control.</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Instructor Account Recovery</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Reset your instructor access.</h1>
          <p className="mt-4 text-base text-slate-600">
            MoveMyTest instructor accounts are separate and focused only on test swap visibility. You will only receive a reset link if you registered as a MoveMyTest instructor.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            Your instructor dashboard and learner links are not affected by a password reset.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}