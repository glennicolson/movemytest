import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Coffee, HeartHandshake, MailCheck, ShieldCheck, XCircle } from "lucide-react";
import { requireMoveMyTestSession } from "@/features/movemytest/session";

const PAYPAL_DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=7ZKTG6PJNV2ZJ";

const contributionOptions = [
  { amount: "£3", description: "helps cover emails and hosting" },
  { amount: "£5", description: "supports a learner using MoveMyTest free" },
  { amount: "£10", description: "helps keep the service running" },
  { amount: "Custom", description: "choose an amount that feels right" },
];

type PageProps = { searchParams?: Promise<{ donation?: string }> };

export default async function DashboardSupportUsPage({ searchParams }: PageProps) {
  await requireMoveMyTestSession("/dashboard/support-us");
  const params = await searchParams;
  const donationStatus = params?.donation;

  return (
    <div className="space-y-8">
      {donationStatus === "thanks" ? <StatusBanner type="thanks" /> : null}
      {donationStatus === "cancelled" ? <StatusBanner type="cancelled" /> : null}

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Optional support</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Help keep MoveMyTest free</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
          MoveMyTest is free for learners. If the service helped you, an optional one-off contribution helps cover
          the real running costs so we can keep it available for everyone.
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          There is no obligation to contribute. Donations do not affect matching, support, booking-reference access, or
          any part of the MoveMyTest process.
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
          <a
            href={PAYPAL_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]"
          >
            <Coffee className="mr-2 h-4 w-4" /> Buy us a coffee
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:text-[var(--brand-strong)]"
          >
            Back to overview
          </Link>
        </div>

        <div className="mt-8 grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 sm:grid-cols-[160px_1fr] sm:items-center">
          <div className="mx-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mx-0">
            <Image
              src="/movemytest-paypal-qr.png"
              alt="QR code for MoveMyTest PayPal contribution link"
              width={136}
              height={136}
              className="h-[136px] w-[136px]"
            />
          </div>
          <div>
            <h3 className="font-semibold text-slate-950">Scan to support from your phone</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This QR code opens the same PayPal contribution page. It is useful if you are viewing MoveMyTest on a
              desktop, or if an instructor shares the service in person.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <SupportCard
          icon={<MailCheck className="h-6 w-6" />}
          title="Email and hosting"
          text="Contributions help cover secure email delivery, hosting, database and monitoring costs."
        />
        <SupportCard
          icon={<ShieldCheck className="h-6 w-6" />}
          title="Safety features"
          text="They support privacy-first matching, secure booking-reference handling and account security features."
        />
        <SupportCard
          icon={<HeartHandshake className="h-6 w-6" />}
          title="Learner support"
          text="They help us keep the service available without charging learners to find or complete a swap."
        />
      </div>
    </div>
  );
}

function StatusBanner({ type }: { type: "thanks" | "cancelled" }) {
  if (type === "thanks") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="font-semibold">Thank you for helping keep MoveMyTest free</h2>
            <p className="mt-2 text-sm leading-6">
              Your support helps cover hosting, secure email, safety features and support, so learners can continue
              using the service for free. We really appreciate it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
      <div className="flex gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="font-semibold">Contribution cancelled</h2>
          <p className="mt-2 text-sm leading-6">
            You returned to MoveMyTest without completing the contribution. That is fine — the service remains free
            for learners.
          </p>
        </div>
      </div>
    </div>
  );
}

function SupportCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-[var(--brand)]">{icon}</div>
      <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
