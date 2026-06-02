import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PhoneCall, ShieldCheck, LockKeyhole, UsersRound, Clock, X, Eye } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, faqSchema, organizationSchema, websiteSchema, moveMyTestServiceSchema } from "@/components/seo/schemas";
import { DVSA_SWAP_PHONE } from "@/features/movemytest/constants";

export const metadata: Metadata = {
  title: "MoveMyTest — Get your driving test moved. For FREE.",
  description:
    "The free, privacy-first way to get your driving test moved. We connect you with another learner who wants your date. DVSA does the swap on the phone. We don't take a cut, we don't harvest your data, and we never sell your information.",
  keywords: ["driving test swap", "DVSA test swap", "learner test exchange", "driving test date swap", "free test swap", "practical test swap", "MoveMyTest"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "MoveMyTest — Get your driving test moved. For FREE.",
    description:
      "The free, privacy-first way to get your driving test moved. We connect you with another learner. DVSA does the swap on the phone. We don't take a cut, we don't harvest your data.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoveMyTest — Get your driving test moved. For FREE.",
    description: "The free, privacy-first way to get your driving test moved. We don't take a cut, we don't harvest your data.",
    images: ["/opengraph-image"],
  },
};

const faqs = [
  { question: "Does MoveMyTest swap my driving test for me?", answer: "No. We help you find another learner who wants your date. The official swap is done by phone with DVSA." },
  { question: "Is it really FREE?", answer: "Yes. No card, no subscription, no success fee. MoveMyTest is supported by DTC, our brother service, because a fair private test-swap service should exist." },
  { question: "What data do you collect?", answer: "Only your email address, your DVSA booking reference, and your test date. We do not ask for your driving licence number, theory certificate number, or home address. You can request deletion of your account at any time." },
  { question: "Do you sell my data?", answer: "Never. We do not sell, rent, or trade your personal information to anyone — not to instructors, not to data brokers, not to advertisers." },
  { question: "What details should I never share with another learner?", answer: "Never share your driving licence number, theory certificate number, home address, payment card details, or GOV.UK login details with another learner." },
  { question: "When does the other learner see my booking reference?", answer: "Only after both learners have accepted the match AND both have completed the booking reference consent form. Before that, the other learner cannot see it." },
  { question: "What number do I call for the official swap?", answer: `DVSA customer services is ${DVSA_SWAP_PHONE}. MoveMyTest is not DVSA, DVLA, DVA, nidirect, or GOV.UK. We are an independent service that helps you do the official swap faster.` },
];

export default function MoveMyTestLandingPage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={moveMyTestServiceSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }])} />
      <JsonLd data={faqSchema([{ category: "MoveMyTest", items: faqs }])} />
      <div className="bg-[var(--ink-50)]">
        {/* ── Hero: the mission is the hero. No image, no video, no mascot. ── */}
        <section className="phase1-hero-mesh">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <p
              className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]"
              style={{ color: "var(--ink-700)" }}
            >
              The free, privacy-first way to get your driving test moved
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: "var(--ink-900)" }}>
              Get your driving test moved. <span style={{ color: "var(--accent-amber-strong)" }}>For FREE.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8" style={{ color: "var(--ink-700)" }}>
              We connect you with another learner who&apos;s got the date you need. DVSA does the swap on the phone.
              We don&apos;t take a cut, we don&apos;t harvest your data, and we never sell your information.
              We help you do the official DVSA swap with another learner, for FREE.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/start"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: "var(--ink-900)" }}
              >
                Find a swap <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-lg border bg-white px-6 py-3 text-base font-semibold transition hover:bg-[var(--ink-50)]"
                style={{ borderColor: "var(--ink-200)", color: "var(--ink-900)" }}
              >
                How it works
              </Link>
            </div>
            <p className="mt-6 text-sm" style={{ color: "var(--ink-500)" }}>
              No card needed. No signup to see how it works. 90 seconds to list your test.
            </p>
          </div>
        </section>

        {/* ── Trust strip: three concrete, verifiable claims ── */}
        <section className="border-y" style={{ borderColor: "var(--ink-100)", backgroundColor: "var(--white, #ffffff)" }}>
          <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 sm:py-12 lg:px-8">
            {[
              { Icon: ShieldCheck, label: "DVSA-compliant", sub: "Official process only" },
              { Icon: LockKeyhole, label: "Privacy first", sub: "We don't sell your data" },
              { Icon: PhoneCall, label: "We don't make money", sub: "Funded by DTC as a public service" },
            ].map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-6 w-6 flex-shrink-0" style={{ color: "var(--ink-900)" }} />
                <div>
                  <p className="text-base font-semibold" style={{ color: "var(--ink-900)" }}>{label}</p>
                  <p className="text-sm" style={{ color: "var(--ink-500)" }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why we exist: the comparison table. This IS the differentiator. ── */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--ink-500)" }}>Why we exist</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--ink-900)" }}>
              UK driving tests have a 22-week wait. Resellers charge £200–£700+ to skip the line. We don&apos;t.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7" style={{ color: "var(--ink-700)" }}>
              Some sites and apps promise to find you an earlier date. They charge you, ask for your driving licence
              number, harvest your data, and sometimes take a cut from your instructor. MoveMyTest does the
              opposite.
            </p>

            <div
              className="mt-10 overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--ink-100)" }}
            >
              <table className="w-full text-left text-sm">
                <thead style={{ backgroundColor: "var(--ink-900)", color: "#ffffff" }}>
                  <tr>
                    <th className="px-5 py-4 font-semibold"> </th>
                    <th className="px-5 py-4 font-semibold">Resellers</th>
                    <th className="px-5 py-4 font-semibold">Cancellation apps</th>
                    <th className="px-5 py-4 font-semibold" style={{ backgroundColor: "var(--accent-amber)" }}>
                      MoveMyTest
                    </th>
                  </tr>
                </thead>
                <tbody style={{ color: "var(--ink-700)" }}>
                  {[
                    ["Cost to you", "£200 – £700+", "£30 – £50 / month", "FREE"],
                    ["Your driving licence number", "Required", "Required", "Not asked"],
                    ["Your data sold to third parties", "Often", "Often", "Never"],
                    ["Takes a cut from your instructor", "Often", "Yes", "Never"],
                    ["What the other side sees about you", "Booking reference + your name + phone", "Booking reference + your name + phone", "Test date + DVSA booking reference only"],
                    ["Works within DVSA rules", "Sometimes not", "Yes", "Yes"],
                  ].map(([feature, ...cols], i) => (
                    <tr
                      key={feature}
                      className={i % 2 === 0 ? "" : ""}
                      style={{ borderTop: "1px solid var(--ink-100)", backgroundColor: i % 2 === 0 ? "#ffffff" : "var(--ink-50)" }}
                    >
                      <td className="px-5 py-4 font-medium" style={{ color: "var(--ink-900)" }}>{feature}</td>
                      {cols.map((c, j) => (
                        <td
                          key={j}
                          className="px-5 py-4"
                          style={j === 2 ? { backgroundColor: "var(--accent-amber-soft)", fontWeight: 600, color: "var(--ink-900)" } : undefined}
                        >
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-sm" style={{ color: "var(--ink-500)" }}>
              MoveMyTest is supported by DTC, our brother service. It is free for you because DTC believes
              a fair, private test-swap service should exist. We don&apos;t take a cut from your instructor, we
              don&apos;t sell your data, and we don&apos;t show ads.{" "}
              <Link href="/how-it-works" className="underline" style={{ color: "var(--ink-900)" }}>
                Read more about how it works →
              </Link>
            </p>
          </div>
        </section>

        {/* ── How it works: 3 steps, no jargon ── */}
        <section className="border-y" style={{ borderColor: "var(--ink-100)", backgroundColor: "var(--ink-50)" }}>
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--ink-500)" }}>How it works</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--ink-900)" }}>
              Three steps. About 90 seconds of your time.
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  n: "1",
                  title: "Tell us your test",
                  text: "Enter the date, time, and centre of your current test. Tell us which dates and centres would also work for you. That's all we need to start looking for a match.",
                },
                {
                  n: "2",
                  title: "We find a match",
                  text: "Our match engine checks DVSA rules, centre compatibility, and date constraints. When we find another learner who wants your date, you get a private match room.",
                },
                {
                  n: "3",
                  title: "You call DVSA together",
                  text: "Once both learners accept and both have completed the booking reference consent, you call DVSA on 0300 200 1122. DVSA confirms the swap. Done.",
                },
              ].map(({ n, title, text }) => (
                <div
                  key={n}
                  className="rounded-xl border bg-white p-6"
                  style={{ borderColor: "var(--ink-100)" }}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: "var(--ink-900)" }}
                  >
                    {n}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold" style={{ color: "var(--ink-900)" }}>{title}</h3>
                  <p className="mt-3 text-sm leading-6" style={{ color: "var(--ink-700)" }}>{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link
                href="/start"
                className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: "var(--ink-900)" }}
              >
                Start a listing <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── What you won't be asked to share ── */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--ink-500)" }}>Privacy, plainly</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--ink-900)" }}>
              What you won&apos;t be asked to share
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7" style={{ color: "var(--ink-700)" }}>
              We collect the minimum data needed to operate the swap. Here&apos;s the full list of what we
              <em> never </em> ask for:
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Your driving licence number",
                "Your theory test pass number",
                "Your home address",
                "Your payment card details",
                "Your GOV.UK login details",
                "Your date of birth",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg border bg-[var(--ink-50)] p-4"
                  style={{ borderColor: "var(--ink-100)" }}
                >
                  <X className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "var(--signal-err)" }} />
                  <span className="text-sm" style={{ color: "var(--ink-700)" }}>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm" style={{ color: "var(--ink-500)" }}>
              We do collect: your email address (so we can notify you of a match), your DVSA booking reference
              number, and your test date.{" "}
              <Link href="/security" className="underline" style={{ color: "var(--ink-900)" }}>
                Read the full security page →
              </Link>
            </p>
          </div>
        </section>

        {/* ── Two audiences: learners + instructors ── */}
        <section className="border-y" style={{ borderColor: "var(--ink-100)", backgroundColor: "var(--ink-50)" }}>
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <article
              className="rounded-xl border bg-white p-6 sm:p-8"
              style={{ borderColor: "var(--ink-100)" }}
            >
              <UsersRound className="h-7 w-7" style={{ color: "var(--ink-900)" }} />
              <h2 className="mt-4 text-2xl font-bold tracking-tight" style={{ color: "var(--ink-900)" }}>
                Built for learners who want a cleaner route
              </h2>
              <p className="mt-3 text-sm leading-6" style={{ color: "var(--ink-700)" }}>
                You booked your test months ago. Then life changed — university, a job, a baby, a move, a
                bereavement. You can&apos;t do the test on the date you booked, and the next available one is
                22 weeks away. MoveMyTest helps you find another real learner who wants your date.
              </p>
              <ul className="mt-5 space-y-2 text-sm leading-6" style={{ color: "var(--ink-700)" }}>
                {[
                  "Match on centre, date, time, and test type — not just availability",
                  "No pressure to accept: review the match before anyone gets your details",
                  "Your instructor stays in the loop so you don&apos;t end up with a date you can&apos;t use",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--ink-500)" }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article
              className="rounded-xl border bg-white p-6 sm:p-8"
              style={{ borderColor: "var(--ink-100)" }}
            >
              <Eye className="h-7 w-7" style={{ color: "var(--ink-900)" }} />
              <h2 className="mt-4 text-2xl font-bold tracking-tight" style={{ color: "var(--ink-900)" }}>
                Built for instructors who want safer pupil swaps
              </h2>
              <p className="mt-3 text-sm leading-6" style={{ color: "var(--ink-700)" }}>
                After the 2026 DVSA rule change, you can no longer manage test bookings directly for your
                pupils. MoveMyTest fills the gap: you see proposed slot changes before your pupil commits, so
                you can protect readiness, lesson schedules, and holiday dates.
              </p>
              <ul className="mt-5 space-y-2 text-sm leading-6" style={{ color: "var(--ink-700)" }}>
                {[
                  "Linked pupils appear on your instructor dashboard automatically",
                  "Set blackout dates and availability windows your pupils can see",
                  "Approve or flag swaps based on readiness — not just calendar fit",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: "var(--ink-500)" }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/instructor"
                  className="inline-flex items-center text-sm font-semibold underline"
                  style={{ color: "var(--ink-900)" }}
                >
                  MoveMyTest for instructors →
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* ── FAQs ── */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: "var(--ink-900)" }}>FAQs</h2>
          <div
            className="mt-8 divide-y rounded-xl border bg-white"
            style={{ borderColor: "var(--ink-100)" }}
          >
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="cursor-pointer text-base font-semibold" style={{ color: "var(--ink-900)" }}>{faq.question}</summary>
                <p className="mt-3 text-sm leading-6" style={{ color: "var(--ink-700)" }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Footer note: not DVSA, and the DTC brother-service transparency ── */}
        <section
          className="border-t"
          style={{ borderColor: "var(--ink-100)", backgroundColor: "var(--ink-50)" }}
        >
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-sm" style={{ color: "var(--ink-500)" }}>
              MoveMyTest is built by the same team as DTC Test Swap, our brother service, and supported by DTC.
              We do not share your personal data between the two services. The only data shared with a matched
              learner is your test date and your DVSA booking reference number.
            </p>
            <p className="mt-3 text-xs" style={{ color: "var(--ink-500)" }}>
              MoveMyTest is not DVSA, DVLA, DVA, nidirect, or GOV.UK. We are an independent peer-to-peer matching
              service. The official swap is completed directly between the learner and DVSA.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
