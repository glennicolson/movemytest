import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, Eye, LockKeyhole, PhoneCall, ShieldCheck, UsersRound } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { TrustpilotTrustBox } from "@/components/reviews/trustpilot-trustbox";
import { breadcrumbSchema, faqSchema, organizationSchema, websiteSchema, moveMyTestServiceSchema } from "@/components/seo/schemas";
import { DVSA_SWAP_PHONE } from "@/features/movemytest/constants";

export const metadata: Metadata = {
  title: "MoveMyTest — Free, Privacy-First Driving MoveMyTests",
  description: "The free, private, and DVSA-compliant driving test swap platform. No bots, no card required, and no public exposure — just real learner-to-learner matching with your instructor in the loop.",
  keywords: ["driving test swap", "DVSA test swap", "learner test exchange", "driving test date swap", "free test swap", "practical test swap", "MoveMyTest"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "MoveMyTest — Free, Privacy-First Driving MoveMyTests",
    description: "The free, private, and DVSA-compliant driving test swap platform. No bots, no card required, and no public exposure — just real learner-to-learner matching with your instructor in the loop.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoveMyTest — Free, Privacy-First Driving MoveMyTests",
    description: "Free, private, and DVSA-compliant learner-to-learner test matching. No bots, no card needed, no public exposure.",
    images: ["/opengraph-image"],
  },
};

const faqs = [
  { question: "Does MoveMyTest swap my driving test for me?", answer: "No. MoveMyTest helps learners find a possible peer-to-peer match. The official swap is completed by phone with DVSA." },
  { question: "Is MoveMyTest free?", answer: "Yes. It is free forever, with no card, subscription or success fee." },
  { question: "Can I swap any test?", answer: "The live workflow is for practical car driving tests in England, Scotland and Wales. Northern Ireland centres are listed, but DVA swap support is disabled until the process is confirmed." },
  { question: "What details should I never share?", answer: "Never share your driving licence number, theory certificate number, home address, payment card details or GOV.UK login details with another learner." },
  { question: "When do booking references get shared?", answer: "Only after both learners accept a proposed match and explicitly consent while they are ready for the DVSA phone process." },
  { question: "What number do learners call for the official swap?", answer: `DVSA customer services is ${DVSA_SWAP_PHONE}. MoveMyTest is not DVSA, DVLA, DVA, nidirect or GOV.UK.` },
];

export default function MoveMyTestLandingPage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={moveMyTestServiceSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }])} />
      <JsonLd data={faqSchema([{ category: "MoveMyTest", items: faqs }])} />
      <div className="bg-white">
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          {/* Left column: the pitch */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Free. Private. Learner-first.</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">Move your driving test without giving away control.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Find a real learner who wants your slot. Review the match privately. Then complete the official DVSA phone swap yourself — no bots, no fees, and no public exposure of your details.
            </p>
            <div className="mt-6 grid max-w-3xl gap-3 text-sm font-semibold text-slate-800 sm:grid-cols-2">
              {[
                "Free forever — no card, subscription or success fee",
                "Private match rooms keep booking references hidden until both learners consent",
                "No bots, no scraping, no booking automation",
                "Instructor-aware matching so your new date actually works",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--brand)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/start" className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white">Start a free private listing <ArrowRight className="ml-2 h-4 w-4" /></Link>
              <Link href="/test-centres" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:!text-white">Browse test centres</Link>
              <Link href="/why-use-the-dtc-movemytest" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:!text-white">Why use MoveMyTest?</Link>
              <Link href="/instructor" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:!text-white">For instructors</Link>
              <Link href="/support-us" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:!text-white">Help keep it free</Link>
            </div>
          </div>

          {/* Right column: trust anchor — no text repetition */}
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,var(--brand-strong),var(--brand))] p-6 text-white shadow-2xl flex flex-col">
            {/* How it works in one glance */}
            <div className="rounded-3xl bg-white/15 p-5 ring-1 ring-white/20">
              <PhoneCall className="h-10 w-10 text-emerald-100" />
              <h2 className="mt-5 text-2xl font-semibold">The swap, step by step.</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-100">
                <li className="flex gap-2"><span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">1</span> List only the details needed for matching — no licence, address or card info.</li>
                <li className="flex gap-2"><span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">2</span> We check DVSA rules and propose a compatible match in a private room.</li>
                <li className="flex gap-2"><span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">3</span> Both learners consent, then call {DVSA_SWAP_PHONE} to complete the official swap.</li>
              </ol>
            </div>

            {/* Trust seals: visual credibility, not text walls */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs leading-5">
              <div className="rounded-2xl bg-white/10 px-3 py-3 text-center">
                <ShieldCheck className="mx-auto mb-1 h-5 w-5 text-emerald-200" />
                <span className="font-semibold">DVSA-compliant</span>
                <p className="mt-0.5 text-white/70">Official process only</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-3 text-center">
                <CreditCard className="mx-auto mb-1 h-5 w-5 text-emerald-200" />
                <span className="font-semibold">No card needed</span>
                <p className="mt-0.5 text-white/70">Free, now and always</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-3 text-center">
                <LockKeyhole className="mx-auto mb-1 h-5 w-5 text-emerald-200" />
                <span className="font-semibold">Private by default</span>
                <p className="mt-0.5 text-white/70">Details stay hidden</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-3 text-center">
                <Eye className="mx-auto mb-1 h-5 w-5 text-emerald-200" />
                <span className="font-semibold">Instructor-aware</span>
                <p className="mt-0.5 text-white/70">Diary-safe swaps</p>
              </div>
            </div>

            <div className="mt-auto rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-xs text-white/80">
              MoveMyTest is a peer-to-peer matching facilitator, not an agent, broker or booking service. The official swap is completed directly between the learner and DVSA.
            </div>
          </div>
        </section>

        {/* Trust + Trustpilot */}
        <section className="border-y border-slate-200 bg-slate-50 py-12">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Trust from real learners</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Built by MoveMyTest, trusted by the people who use it.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                Real reputation matters when you&apos;re handing over a test date. MoveMyTest has earned trust across the UK driving community — and our Trustpilot reviews show it.
              </p>
            </div>
            <TrustpilotTrustBox />
          </div>
        </section>

        {/* Three pillars: the product values without re-listing hero points */}
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            { Icon: ShieldCheck, title: "Compliance first", text: "Every match respects DVSA rules: same test type, same location, 10 full working days&apos; notice, exact-slot exchange. No shortcuts." },
            { Icon: LockKeyhole, title: "Privacy first", text: "Your licence number, theory certificate, home address and card details are never collected. Sensitive match details stay inside private rooms until both sides are ready." },
            { Icon: UsersRound, title: "Community first", text: "Free forever for every learner. No waiting list, no pricing tier, no success fee. Sustained by the community that uses it, not by monetising urgency." },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Icon className="h-8 w-8 text-[var(--brand)]" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </section>

        {/* How it works: the process — not re-listing the hero */}
        <section className="border-y border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-950">How MoveMyTest makes swapping safer</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ["1", "List what you have, say what you want", "Add your current centre, date, time and test type — plus which centres and dates you&apos;d consider. That&apos;s all we need to start looking for a match."],
                ["2", "We find someone compatible", "Our match engine checks centre rules, date constraints, test types and DVSA timing before surfacing a proposal. No public posting. No spam. No random offers."],
                ["3", "You review, agree, then call DVSA", "See the match in your private room. If both sides accept, you get the booking references you need and call DVSA together to complete the official swap."],
              ].map(([number, title, text]) => (
                <div key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">{number}</span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Two-audience section: fresh angles, no hero recycling */}
        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <UsersRound className="h-8 w-8 text-[var(--brand)]" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">Built for learners who want a cleaner route</h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">The alternative to swap apps is either paying someone, posting your details publicly, or hoping for a cancellation. MoveMyTest gives you a structured, private way to find another real learner who wants what you have — and has what you want.</p>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-700">
              {[
                "Match on centre, date, time, and test type — not just availability",
                "No pressure to accept: review the match before anyone gets your details",
                "Your instructor stays in the loop so you don&apos;t end up with a date you can&apos;t use",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 text-[var(--brand)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <Eye className="h-8 w-8 text-[var(--brand)]" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">Built for instructors who want safer pupil swaps</h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">After the 2026 DVSA rule change, instructors can no longer manage test bookings directly. MoveMyTest fills the gap: you see proposed slot changes before your pupil commits, so you can protect readiness, lesson schedules, and holiday dates.</p>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-700">
              {[
                "Linked pupils appear on your instructor dashboard automatically",
                "Set blackout dates and availability windows your pupils can see",
                "Approve or flag swaps based on readiness — not just calendar fit",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 h-4 w-4 text-[var(--brand)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* FAQs + disclaimer */}
        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-950">FAQs</h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
            {faqs.map((faq) => <details key={faq.question} className="group p-5"><summary className="cursor-pointer font-semibold text-slate-950">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p></details>)}
          </div>
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <CheckCircle2 className="mb-2 h-5 w-5" /> MoveMyTest is not DVSA, DVLA, DVA, nidirect or GOV.UK. MoveMyTest only facilitates peer-to-peer matching. Learners must complete the official swap directly with DVSA.
          </div>
        </section>
      </div>
    </>
  );
}
