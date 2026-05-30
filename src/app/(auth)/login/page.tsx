import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoveMyTestLoginForm } from "@/components/movemytest/movemytest-login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In to MoveMyTest",
  description: "Sign in to your free MoveMyTest account to manage your listing, mobile alerts and learner-to-learner matches.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Sign In to MoveMyTest",
    description: "Sign in to your free MoveMyTest account to manage your listing, mobile alerts and learner-to-learner matches.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In to MoveMyTest",
    description: "Sign in to your free MoveMyTest account to manage your listing, mobile alerts and learner-to-learner matches.",
  },
};

export default async function MoveMyTestLoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest</p>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Return to your MoveMyTest dashboard, manage your listing and respond when a suitable learner match appears.
            </CardDescription>
            <MoveMyTestLoginForm from={from} />
          </Card>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm font-medium text-slate-500 transition hover:text-zinc-700">Back to MoveMyTest</Link>
          </div>
        </div>
      </section>
      <section className="flex items-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12 text-slate-900 lg:px-12">
        <div className="mx-auto max-w-lg">
          {/* Logo */}
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
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Private MoveMyTest access</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">Pick up where you left off.</h1>
          <p className="mt-4 text-base text-slate-600">
            Sign in to manage your swap listing, update your details, check potential matches and continue the safe DVSA phone-swap process.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            Keep your test swap listing and match alerts safe. Sign in to manage your listing and respond when a suitable match appears.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}
