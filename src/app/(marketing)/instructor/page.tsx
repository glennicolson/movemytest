import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, ClipboardCheck, Handshake, LockKeyhole, PhoneCall, ShieldCheck, UsersRound } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { TrustpilotTrustBox } from "@/components/reviews/trustpilot-trustbox";
import { breadcrumbSchema, faqSchema } from "@/components/seo/schemas";
import { DVSA_SWAP_PHONE } from "@/features/movemytest/constants";

export const metadata: Metadata = {
  title: "MoveMyTest for Driving Instructors",
  description: "How MoveMyTest helps driving instructors support learners, check swap suitability, manage ADI-linked listings, and keep test swaps safe and free.",
  alternates: { canonical: "http://localhost:6003/instructor" },
  openGraph: {
    title: "MoveMyTest for Driving Instructors",
    description: "A plain-English guide for ADIs: what MoveMyTest is, how it works, and how it helps instructors and learners.",
    url: "/instructor",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoveMyTest for Driving Instructors",
    description: "A plain-English guide for ADIs: what MoveMyTest is, how it works, and how it helps instructors and learners.",
    images: ["/opengraph-image"],
  },
};

const faqs = [
  {
    question: "Is MoveMyTest only for MoveMyTest instructors?",
    answer: "No. Independent ADIs can register for a standalone MoveMyTest instructor account using their ADI number. MoveMyTest instructors can also access MoveMyTest from the existing instructor portal.",
  },
  {
    question: "Does MoveMyTest book or swap the learner's test for them?",
    answer: `No. MoveMyTest helps identify a possible learner-to-learner match. The official swap still has to be completed by phone with DVSA on ${DVSA_SWAP_PHONE}.`,
  },
  {
    question: "Can instructors see learners who are not MoveMyTest pupils?",
    answer: "Yes, for MoveMyTest only. Learners can be linked by ADI number, and MoveMyTest instructors can invite non-MoveMyTest learners into the standalone MoveMyTest flow without creating CRM learner records.",
  },
  {
    question: "What does the instructor dashboard show?",
    answer: "It shows learners linked to your ADI number, current and proposed test slots, match awareness, and availability decisions so you can help learners decide whether a swap is realistic.",
  },
  {
    question: "Is MoveMyTest free for learners?",
    answer: "Yes. Learners are not charged a subscription, success fee or matching fee. Optional support contributions are separate and never affect matching or support priority.",
  },
];

const benefits = [
  {
    icon: CalendarCheck,
    title: "Protect your diary",
    text: "See current and proposed test dates linked to your ADI number, then record whether you are available before learners commit to a swap.",
  },
  {
    icon: UsersRound,
    title: "Support more learners fairly",
    text: "Help test-ready learners find genuine learner-to-learner swaps without encouraging paid slot reselling or unofficial booking services.",
  },
  {
    icon: ShieldCheck,
    title: "Keep the process compliant",
    text: "The workflow is built around DVSA rules: exact slot exchange, remaining changes, the 10 full working day window, matching test types and location limits.",
  },
  {
    icon: LockKeyhole,
    title: "Limit sensitive information",
    text: "Learners are warned not to share licence numbers, theory certificate details, addresses, payment cards or GOV.UK login details.",
  },
];

export default function MoveMyTestInstructorExplainerPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "MoveMyTest", href: "/" }, { name: "For instructors", href: "/instructor" }])} />
      <JsonLd data={faqSchema([{ category: "MoveMyTest for instructors", items: faqs }])} />
      <main className="bg-white">
        <section className="bg-[linear-gradient(135deg,var(--brand-strong),var(--brand))] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div>
              <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Visibility for qualified ADI's and trainee driving instructors
              </p>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                Keep visibility when learners move their own tests.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-100">
                MoveMyTest gives instructors a clearer way to support learners who already have a practical car test but need a different date, time or centre.
              </p>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-100">
                New DVSA rules mean learners manage the official booking themselves. MoveMyTest helps you stay informed before a learner swaps into a date, time or centre that clashes with your diary or no longer suits their readiness.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/instructor/register" className="inline-flex items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-sm font-semibold !text-[var(--brand-strong)] shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white">
                  Register as an instructor <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/instructor/login" className="inline-flex items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-sm font-semibold !text-[var(--brand-strong)] shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white">
                  Instructor login
                </Link>
                <Link href="/how-it-works" className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:!text-[var(--brand-strong)]">
                  How learner swaps work
                </Link>
              </div>
            </div>
            <aside className="rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <ClipboardCheck className="h-10 w-10 text-emerald-200" />
              <h2 className="mt-5 text-2xl font-semibold">What instructors get</h2>
              <ul className="mt-5 grid gap-3 text-sm font-semibold text-white">
                {[
                  "Linked learners by ADI number",
                  "Current and proposed test-slot visibility",
                  "Availability decisions before learners commit",
                  "Calendar awareness for blackout dates and clashes",
                  "A safer alternative to paid slot reselling",
                  "Protect readiness, not just slot speed",
                  "DVSA rule-aware matching so swaps stay valid",
                  "Privacy-first design — no licence or card data held",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-200" /> {item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-50 py-12">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">MoveMyTest reputation</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Instructor trust starts with a cleaner learner promise.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                MoveMyTest needs to feel like the calm, credible option. That matters to instructors because if the learner-side service feels risky, pushy or marketplace-like, it creates support problems for you too.
              </p>
            </div>
            <TrustpilotTrustBox />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <Icon className="h-8 w-8 text-[var(--brand)]" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Why it matters</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Learners can now move their own tests. That creates a visibility problem for instructors.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                Many learners reach test standard, then get stuck with a date, time or centre that no longer works. Others find a tempting alternative date that looks better on paper but does not fit your diary, their preparation level, or the practical travel reality.
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                MoveMyTest exists because learners should not have to pay inflated fees or rely on questionable services just to look for a fair swap. For instructors, the value is that the process stays visible before the learner commits.
              </p>
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
                <strong>The instructor&apos;s role is still critical:</strong> you help learners decide whether a proposed slot is realistic before they accept, especially where journey time, readiness and your availability matter.
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">What MoveMyTest does</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">It gives you visibility. It does not try to replace DVSA.</h2>
              <div className="mt-5 grid gap-3">
                {[
                  "MoveMyTest does not book driving tests — learners must already have a booked DVSA test.",
                  "MoveMyTest does not change or cancel a GOV.UK booking.",
                  "MoveMyTest does not sell test slots or charge a learner matching fee.",
                  "MoveMyTest does not take over the instructor-learner relationship.",
                  "MoveMyTest is a separate service, so non-MoveMyTest learners can still use it safely.",
                  "The official swap must be completed by phone with DVSA.",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">{item}</div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-700">
                MoveMyTest helps collect the minimum matching details, checks compatibility, shows possible matches, and gives learners a safer place to accept, decline or report a proposed swap.
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <aside className="rounded-3xl bg-[linear-gradient(135deg,var(--brand-strong),var(--brand))] p-6 text-white shadow-sm">
              <PhoneCall className="h-9 w-9 text-emerald-100" />
              <h2 className="mt-4 text-2xl font-semibold">The official swap is still DVSA by phone.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-100">
                Learners must complete the official swap with DVSA on {DVSA_SWAP_PHONE}. MoveMyTest helps them prepare and find a possible match; DVSA performs the official security checks and updates the bookings. That separation is important because it keeps the legal booking action with the learner while still letting you stay informed beforehand.
              </p>
            </aside>
            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <Handshake className="h-9 w-9 text-[var(--brand)]" />
              <h2 className="mt-4 text-2xl font-semibold text-slate-950">We respect your learner relationship</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                We understand that your learner has built trust with you, and we fully respect that. MoveMyTest is only here to help them with one thing: finding a fair way to move their driving test date. When you support them in using MoveMyTest, you are helping them take the final step while keeping that instructor relationship intact. It also shows that you are backing a fairer, more reliable system for learners across the UK.
              </p>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">How it works for instructors</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["1", "Register your ADI number", "Create a MoveMyTest instructor account so learners linked to your ADI number can appear in your dashboard. Once registered, you can review linked learners, see their current and proposed test slots, and decide whether you are available before they commit to any swap."],
                    ["2", "Review learner slots", "See current tests, proposed matches and upcoming swap possibilities in an instructor view. You can quickly check whether a proposed new date, time or centre works for your diary and the learner's readiness."],
                    ["3", "Protect your diary", "Confirm whether you are available to cover the learner&apos;s current test or any proposed swapped slot before they go ahead. The learner is asked to confirm that they have spoken to you and that you have agreed to the swap."],
                ].map(([number, title, text]) => (
                  <div key={number} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">{number}</span>
                    <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">The benefits for instructors and learners</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <BenefitList title="For instructors" items={[
                "Less guesswork when a learner asks about a swap.",
                "A clearer view of which learners are linked to your ADI number.",
                "A place to record whether a proposed new test date works for your diary.",
                "A safer process to guide learners away from paid swap markets and unofficial services.",
                "A route to support non-MoveMyTest learners in MoveMyTest without creating DTC CRM learner records.",
              ]} />
              <BenefitList title="For learners" items={[
                "Free access to learner-to-learner matching.",
                "Clear warnings about what information not to share.",
                "A private match room before booking references are revealed.",
                "Instructor availability visibility before committing to a swap.",
                "A fairer option than paying inflated prices for test-slot access.",
              ]} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight">Safety points instructors should reinforce</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-6">
              <li><strong>Do not pay for a driving test swap.</strong> A genuine swap is an exchange between two learners who already have booked tests.</li>
              <li><strong>Do not share sensitive details.</strong> Learners should never share licence numbers, theory certificate numbers, addresses, card details or GOV.UK login details.</li>
              <li><strong>Check readiness and availability first.</strong> A technically compatible slot still needs to work for the learner&apos;s training plan and your diary.</li>
              <li><strong>Use DVSA for the official change.</strong> The final swap must be completed through DVSA by phone.</li>
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[linear-gradient(135deg,var(--brand-strong),var(--brand))] p-8 text-center text-white shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight">Register with MoveMyTest</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-100">
              Use your ADI number to create a MoveMyTest instructor account. Once registered, learner listings linked to your ADI number can appear in your dashboard so you can support availability decisions.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/instructor/register" className="inline-flex justify-center rounded-full border border-white bg-white px-6 py-3 text-sm font-semibold !text-[var(--brand-strong)] transition hover:bg-[var(--brand-strong)] hover:!text-white">
                Register as a MoveMyTest instructor
              </Link>
              <Link href="/instructor/login" className="inline-flex justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:!text-[var(--brand-strong)]">
                Already registered? Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-950">Instructor FAQs</h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="cursor-pointer font-semibold text-slate-950">{faq.question}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function BenefitList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
