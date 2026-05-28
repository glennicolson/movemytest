import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSetPasswordForm } from "@/components/forms/auth-set-password-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { completeMoveMyTestPasswordResetAction } from "@/features/movemytest/login-actions";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset MoveMyTest Password",
  description: "Choose a new password for your MoveMyTest learner account.",
  robots: { index: false, follow: false },
};

export default async function MoveMyTestResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  let errorMessage = "";
  let account: { email: string } | null = null;

  if (token) {
    const found = await prisma.learnerAccount.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gt: new Date() },
        status: "ACTIVE",
      },
      select: { email: true },
    });

    if (found) {
      account = found;
    } else {
      errorMessage = "This reset link is invalid or has expired.";
    }
  } else {
    errorMessage = "Reset token is missing.";
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest</p>
            <CardTitle>Choose a new MoveMyTest password</CardTitle>
            <CardDescription>
              {account
                ? `Reset the password for ${account.email}. This link expires in 1 hour.`
                : errorMessage}
            </CardDescription>
            {account ? (
              <AuthSetPasswordForm
                action={completeMoveMyTestPasswordResetAction}
                token={token}
                submitLabel="Save new password"
                helper="Choose a password with at least 10 characters. You will be signed in straight away after reset."
              />
            ) : null}
          </Card>
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 transition hover:text-zinc-700"
            >
              Back to MoveMyTest sign in
            </Link>
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
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">MoveMyTest Account Recovery</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Choose a new password.</h1>
          <p className="mt-4 text-base text-slate-600">
            Your swap listing and matches are not affected by a password reset.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            Your swap listing and matches are not affected by a password reset. You will keep full control of your data.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}