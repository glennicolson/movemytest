import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, faqSchema, howToSchema } from "@/components/seo/schemas";
import { DVSA_SWAP_PHONE } from "@/features/movemytest/constants";

export const metadata: Metadata = {
  title: "How MoveMyTest Works",
  description: "A plain-English guide to learner driving test swaps, DVSA rules, privacy safeguards and when a swap cannot go ahead.",
  alternates: { canonical: "http://localhost:6003/how-it-works" },
  openGraph: {
    title: "How MoveMyTest Works",
    description: "A plain-English guide to learner driving test swaps, DVSA rules, privacy safeguards and when a swap cannot go ahead.",
    url: "/how-it-works",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "How MoveMyTest Works",
    description: "A plain-English guide to learner driving test swaps, DVSA rules, privacy safeguards and when a swap cannot go ahead.",
    images: ["/opengraph-image"],
  },
};

const faqs = [
  { question: "What is a driving test swap?", answer: "It is an exchange of two existing practical car driving test bookings. You are not booking a new test; both learners must want each other's exact date, time and centre." },
  { question: "What does MoveMyTest do?", answer: "MoveMyTest helps identify compatible learners and provides a private match room. MoveMyTest does not complete the official swap or access DVSA systems for you." },
  { question: "What does DVSA do?", answer: "DVSA completes the official phone process, security checks, legal declarations and booking update." },
  { question: "When can a swap not go ahead?", answer: "A swap cannot go ahead if either learner has no changes left, the earliest test is inside the 10 full working day window, test types differ, either learner does not agree, security checks fail, or location rules are not met." },
  { question: "What changes from 9 June 2026?", answer: "For car tests, each learner can only swap if the other learner’s centre is the same centre, one of the 3 nearest centres, or the test centre first booked for the current booking. This must be true for both learners." },
  { question: "What should I keep private?", answer: "Never share your driving licence number, address, payment card details, card security code, theory certificate number or GOV.UK login details with another learner." },
];

export default function MoveMyTestHowItWorksPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "MoveMyTest", href: "/" }, { name: "How it works", href: "/how-it-works" }])} />
      <JsonLd data={faqSchema([{ category: "MoveMyTest process", items: faqs }])} />
      <JsonLd data={howToSchema({
        name: "How to use MoveMyTest to exchange your driving test",
        description: "A step-by-step guide to finding a compatible learner and completing an official DVSA driving test swap through MoveMyTest.",
        url: "/how-it-works",
        steps: [
          { name: "Create your listing", text: "Enter your current test date, time and centre, plus the dates and centres you would accept. No licence number or address needed." },
          { name: "Wait for a match", text: "MoveMyTest checks your listing against all other listings and tells you when a compatible learner is found." },
          { name: "Review the match privately", text: "Both learners see a private match card with the exact swap details. Either learner can accept or decline." },
          { name: "Call DVSA together", text: `Both learners call DVSA on ${DVSA_SWAP_PHONE} during the same call-window, confirm identity, and complete the official swap.` },
        ],
      })} />
      <main className="bg-white">
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Safe, official-process aware matching</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">How MoveMyTest works</h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">MoveMyTest is a free matching service. It helps two learners find a possible exact-slot exchange, then both learners complete the official swap by phone with DVSA.</p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          {[
            ["What a swap is", "Two learner drivers exchange their existing practical car test bookings. Both must want each other’s exact date, time and test centre."],
            ["What MoveMyTest does", "MoveMyTest collects the minimum matching details, checks compatibility and provides a private place to accept, decline or report a proposed match."],
            ["What DVSA does", `DVSA completes the official swap by phone on ${DVSA_SWAP_PHONE}. DVSA performs security checks with each learner and updates the booking records.`],
            ["What details are needed", "Current centre, original centre if known, date, time, test type, remaining-change confirmation and preferred dates/times/centres. We do not collect licence numbers, theory certificate numbers, addresses or card details."],
          ].map(([title, text]) => (
            <article key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{text}</p>
            </article>
          ))}
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-950">Key DVSA rules MoveMyTest checks</h2>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-700">
              <li><strong>Exact slot exchange:</strong> both learners must want each other’s date, time and centre.</li>
              <li><strong>Remaining changes:</strong> both learners need at least 1 of their 2 allowed changes remaining.</li>
              <li><strong>10 full working days:</strong> the swap request must be at least 10 full working days before the earliest test. Monday to Saturday count; Sundays and public holidays do not.</li>
              <li><strong>Test type compatibility:</strong> weekday, evening/weekend/bank holiday, extra-time/special-requirements and extended tests only match with the same type.</li>
              <li><strong>From 9 June 2026:</strong> for car tests, both learners must meet the same/3-nearest/original-centre rule.</li>
              <li><strong>Northern Ireland:</strong> DVA/nidirect manages NI tests. MoveMyTest lists NI centres, but live NI swap matching is disabled until the DVA process is confirmed.</li>
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-950">Privacy warnings</h2>
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm leading-6 text-red-900">
            Never share your driving licence number, home address, payment card details, full card number, card security code, theory certificate details or GOV.UK login details with another learner. DVSA completes security checks directly.
          </div>
          <div className="mt-8 flex gap-3">
            <Link href="/start" className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--brand-strong)] hover:!text-white">Start a free listing</Link>
            <Link href="/test-centres" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white">Browse centres</Link>
          </div>
        </section>
      </main>
    </>
  );
}
