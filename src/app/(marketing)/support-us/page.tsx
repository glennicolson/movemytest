import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, CheckCircle2, Coffee, HeartHandshake, MailCheck, ShieldCheck, XCircle } from "lucide-react";

const PAYPAL_DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=7ZKTG6PJNV2ZJ";

export const metadata: Metadata = {
  title: "Support MoveMyTest",
  description: "Make an optional one-off contribution to help keep MoveMyTest free for learners.",
  alternates: { canonical: "https://movemytest.co.uk/support-us" },
  robots: { index: false, follow: true },
};

type PageProps = { searchParams?: Promise<{ donation?: string }> };

const contributionOptions = [
  { amount: "£3", description: "helps cover emails and hosting" },
  { amount: "£5", description: "supports a learner using MoveMyTest free" },
  { amount: "£10", description: "helps keep the service running" },
  { amount: "Custom", description: "choose an amount that feels right" },
];

export default async function MoveMyTestSupportUsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const donationStatus = params?.donation;

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        {donationStatus === "swap-complete" ? <SwapCompleteBanner /> : null}
        {donationStatus === "thanks" ? <StatusBanner type="thanks" /> : null}
        {donationStatus === "cancelled" ? <StatusBanner type="cancelled" /> : null}

        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Optional support</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">Help keep MoveMyTest free</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
            MoveMyTest is free for learners. If the service helped you, an optional one-off contribution helps cover the real running costs so we can keep it available for everyone.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            There is no obligation to contribute. Donations do not affect matching, support, booking-reference access, or any part of the MoveMyTest process.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contributionOptions.map((option) => (
              <div key={option.amount} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-2xl font-bold text-slate-950">{option.amount}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{option.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={PAYPAL_DONATE_URL} className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]">
              <Coffee className="mr-2 h-4 w-4" /> Buy us a coffee
            </a>
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:text-[var(--brand-strong)]">
              Continue using MoveMyTest for free
            </Link>
          </div>

          <div className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-[160px_1fr] sm:items-center">
            <div className="mx-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mx-0">
              <Image src="/movemytest-paypal-qr.png" alt="QR code for MoveMyTest PayPal contribution link" width={136} height={136} className="h-[136px] w-[136px]" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-950">Scan to support from your phone</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This QR code opens the same PayPal contribution page. It is useful if you are viewing MoveMyTest on a desktop, or if an instructor shares the service in person.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <SupportCard icon={<MailCheck className="h-6 w-6" />} title="Email and hosting" text="Contributions help cover secure email delivery, hosting, database and monitoring costs." />
          <SupportCard icon={<ShieldCheck className="h-6 w-6" />} title="Safety features" text="They support privacy-first matching, secure booking-reference handling and account security features." />
          <SupportCard icon={<HeartHandshake className="h-6 w-6" />} title="Learner support" text="They help us keep the service available without charging learners to find or complete a swap." />
        </div>
      </section>
    </main>
  );
}

function SwapCompleteBanner() {
  return (
    <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
      <div className="flex gap-3">
        <Award className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="font-semibold">Your swap is complete</h2>
          <p className="mt-2 text-sm leading-6">The DVSA phone process has been marked complete. If MoveMyTest helped you get an earlier test date or saved you time, consider a one-off contribution to help keep it free for everyone.</p>
        </div>
      </div>
    </div>
  );
}

function StatusBanner({ type }: { type: "thanks" | "cancelled" }) {
  if (type === "thanks") {
    return (
      <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="font-semibold">Thank you for helping keep MoveMyTest free</h2>
            <p className="mt-2 text-sm leading-6">Your support helps cover hosting, secure email, safety features and support, so learners can continue using the service for free. We really appreciate it.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-800">
      <div className="flex gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="font-semibold">No problem</h2>
          <p className="mt-2 text-sm leading-6">MoveMyTest is still free to use. Thanks for considering supporting the service.</p>
        </div>
      </div>
    </div>
  );
}

function SupportCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-[var(--brand)]">{icon}</div>
      <h2 className="mt-4 font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
