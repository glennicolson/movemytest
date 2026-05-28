import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { MoveMyTestAccountSetupForm } from "@/components/movemytest/movemytest-account-setup-form";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestSession } from "@/features/movemytest/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set Up Your MoveMyTest Account",
  description: "Add your mobile number so MoveMyTest can send SMS or WhatsApp alerts when a suitable MoveMyTest match is available.",
  robots: { index: false, follow: false },
};

export default async function MoveMyTestAccountSetupPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const session = await requireMoveMyTestSession("/account-setup");
  const account = await prisma.learnerAccount.findUnique({ where: { id: session.accountId }, select: { mobileNumber: true } });

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="flex items-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-xl">
          <Card className="border-slate-200/80 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">MoveMyTest</p>
            <CardTitle>Set up your account</CardTitle>
            <CardDescription>
              Add your mobile number so we can alert you quickly by SMS or WhatsApp when a suitable learner-to-learner swap appears.
            </CardDescription>
            <MoveMyTestAccountSetupForm from={from} defaultMobileNumber={account?.mobileNumber} />
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
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Match alerts</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">We need a way to reach you when a swap is available.</h1>
          <p className="mt-4 text-base text-slate-600">Test swaps are time-sensitive. A mobile number lets MoveMyTest send a quick SMS or WhatsApp alert when another learner may be compatible with your booking and preferences.</p>
          <div className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800 shadow-sm">
            We still do not ask for your licence number, theory certificate, home address, payment card details or GOV.UK login details.
          </div>
          <p className="mt-8 text-sm text-slate-400">movemytest.co.uk</p>
        </div>
      </section>
    </main>
  );
}
