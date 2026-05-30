import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, ExternalLink, HeartHandshake, LockKeyhole, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, faqSchema } from "@/components/seo/schemas";
import { DVSA_SWAP_PHONE } from "@/features/movemytest/constants";

export const metadata: Metadata = {
  title: "Why Use MoveMyTest | Free Driving Test Swaps",
  description: "Why MoveMyTest is free, why learners should not pay for driving test swaps, and how MoveMyTest helps learners find fair learner-to-learner matches safely.",
  alternates: { canonical: "https://movemytest.co.uk/why-use-the-dtc-movemytest" },
  openGraph: {
    title: "Why Use MoveMyTest",
    description: "MoveMyTest is free because learners should not have to pay inflated fees to find a fair driving test swap.",
    url: "/why-use-the-dtc-movemytest",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Why Use MoveMyTest",
    description: "MoveMyTest is free because learners should not have to pay inflated fees to find a fair driving test swap.",
    images: ["/opengraph-image"],
  },
};

const faqs = [
  { question: "Is MoveMyTest really free?", answer: "Yes. MoveMyTest is free. MoveMyTest does not charge a subscription, success fee, admin fee or matching fee." },
  { question: "Should I pay someone for a driving test swap?", answer: "No. MoveMyTest encourages learners not to pay anyone for a driving test swap. A genuine swap is an exchange between two learners who already have booked tests and both want each other’s slot." },
  { question: "Can DTC swap my test for me?", answer: "No. The official swap must be completed through DVSA by phone. MoveMyTest helps learners find a possible match, but does not complete the official swap for them." },
  { question: "Is DTC connected to DVSA?", answer: "No. MoveMyTest is independent and is not DVSA, DVLA, DVA, nidirect or GOV.UK." },
  { question: "What information should I never share?", answer: "Never share your driving licence number, theory test certificate number, home address, payment card details, GOV.UK login details or full personal contact details with another learner." },
];

const sourceLinks = [
  ["GOV.UK: Swapping your driving test with another learner driver", "https://www.gov.uk/guidance/swapping-your-driving-test-with-another-learner-driver"],
  ["GOV.UK: End of the road for unofficial driving test booking services", "https://www.gov.uk/government/news/end-of-the-road-for-unofficial-driving-test-booking-services"],
  ["DVSA Despatch: Bots and the reselling of driving tests", "https://despatch.blog.gov.uk/2023/06/29/how-were-dealing-with-bots-and-the-reselling-of-driving-tests/"],
  ["National Audit Office: Driving test delays and costs to learners", "https://www.nao.org.uk/press-releases/watchdog-urges-dvsa-to-address-driving-test-delay-backlog-and-cut-waiting-times/"],
  ["UK Parliament Transport Committee: Driving test backlogs and bots", "https://committees.parliament.uk/committee/153/transport-committee/news/209839/when-will-govt-tackle-driving-test-backlogs-and-stop-the-bots-transport-committee-publishes-letters-with-minister/"],
  ["GOV.UK: Learner drivers warned about cancellation finder risks", "https://www.gov.uk/government/news/learner-drivers-warned-about-the-risks-of-driving-test-cancellation-finders"],
  ["RAC: How much it costs to learn to drive", "https://www.rac.co.uk/drive/advice/learning-to-drive/how-much-does-it-cost-to-learn-to-drive/"],
] as const;

function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-[var(--brand)] underline underline-offset-4 hover:text-[var(--brand-strong)]">
      {children} <ExternalLink className="mb-0.5 inline h-3.5 w-3.5" />
    </a>
  );
}

export default function WhyUseTheDTCMoveMyTestPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "MoveMyTest", href: "/" }, { name: "Why use MoveMyTest", href: "/why-use-the-dtc-movemytest" }])} />
      <JsonLd data={faqSchema([{ category: "Why use MoveMyTest", items: faqs }])} />
      <main className="bg-white">
        <section className="bg-[linear-gradient(135deg,var(--brand-strong),var(--brand))] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
            <div>
              <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">Free, privacy-first learner-to-learner driving test swaps</p>
              <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">Why use MoveMyTest?</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">For years, we have watched learner drivers do everything right, only to be met by a booking system where practical tests were almost impossible to move fairly.</p>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">MoveMyTest is answer to that frustration: a free, private, official-process-aware way to help learners find another learner who may genuinely want to exchange an existing test booking.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/start" className="inline-flex items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-sm font-semibold !text-[var(--brand-strong)] shadow-sm transition hover:border-white hover:bg-[var(--brand-strong)] hover:!text-white">Find a free test swap <ArrowRight className="ml-2 h-4 w-4" /></Link>
                <Link href="/how-it-works" className="inline-flex items-center justify-center rounded-full border border-white bg-white px-6 py-3 text-sm font-semibold !text-[var(--brand-strong)] shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white">How test swaps work</Link>
              </div>
            </div>
            <aside className="rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <HeartHandshake className="h-10 w-10 text-emerald-200" />
              <h2 className="mt-5 text-2xl font-semibold">Our promise to learners</h2>
              <p className="mt-3 text-sm leading-6 text-slate-200">The service is free. Not free for now. Not free until a paywall appears. Free.</p>
              <ul className="mt-5 grid gap-3 text-sm font-semibold text-white">
                {["No subscription", "No success fee", "No hidden charge", "No premium swap list", "No selling test slots", "No public exposure of sensitive booking details"].map((item) => <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-200" /> {item}</li>)}
              </ul>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          <article className="space-y-8">
            <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Learners have been stuck behind the same wall for years</h2>
              <p className="mt-4 text-lg leading-8 text-slate-700">They turn up for lessons, work hard, build confidence, save money and reach the point where they are ready to take their driving test. Then they try to book.</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">No tests. No local availability. No fair chance of finding a slot at the right time. Just endless refreshing, long waits, cancelled plans and the awful feeling that passing your driving test has become less about being ready and more about winning a digital scramble.</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">We have shared that frustration with our learners for years. Before the rule changes, we spent countless hours trying to find tests for pupils who were ready. We helped book hundreds of tests for learners because they were being left stuck in a broken queue.</p>
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>And we understand why the DVSA had to act.</strong> The system needed protection from bots, resellers and services that turned learner desperation into a profit machine.</div>
            </section>

            <section id="problem" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">The problem: learners were being squeezed, and instructors were losing visibility</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">The shortage of practical driving tests has created a situation where too many genuine learners have struggled to book or move a test through the official system.</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">The National Audit Office reported that the average waiting time for a practical car driving test in Great Britain was <strong>22 weeks in September 2025</strong>, compared with just over five weeks in early 2020. It also found that <strong>70% of DVSA test centres</strong> were operating at the maximum 24-week waiting time. <SourceLink href="https://www.nao.org.uk/press-releases/watchdog-urges-dvsa-to-address-driving-test-delay-backlog-and-cut-waiting-times/">Source: National Audit Office</SourceLink></p>
              <p className="mt-4 text-sm leading-6 text-slate-700">When learners are waiting months for a test, the pressure builds. Some need a licence for work, caring responsibilities, or areas where public transport is unreliable. The Transport Committee has warned that the crisis is affecting jobs, family life and independence. <SourceLink href="https://committees.parliament.uk/committee/153/transport-committee/news/209839/when-will-govt-tackle-driving-test-backlogs-and-stop-the-bots-transport-committee-publishes-letters-with-minister/">Source: UK Parliament Transport Committee</SourceLink></p>
              <p className="mt-4 text-sm leading-6 text-slate-700">At the same time, instructors need a cleaner way to stay informed when a learner wants to move into a different date, time or centre. A swap that looks attractive to a learner can still be wrong for readiness, travel or diary availability.</p>
            </section>

            <section id="bots-and-resellers" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Bots, resellers and inflated prices</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">High demand also opened the door for people and businesses looking to profit.</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">DVSA has said that high waiting times led to a rise in automated bots exploiting the booking service. These bots can search for and reserve appointments faster than individual learners, making it harder for test-ready learners to find a date and time of their choice. <SourceLink href="https://despatch.blog.gov.uk/2023/06/29/how-were-dealing-with-bots-and-the-reselling-of-driving-tests/">Source: DVSA Despatch</SourceLink></p>
              <p className="mt-4 text-sm leading-6 text-slate-700">The National Audit Office later reported that delays were resulting in just under a third of learners booking through third-party websites, sometimes paying inflated prices of <strong>up to £500</strong>, compared with the standard weekday DVSA fee of <strong>£62</strong>. <SourceLink href="https://www.nao.org.uk/press-releases/watchdog-urges-dvsa-to-address-driving-test-delay-backlog-and-cut-waiting-times/">Source: National Audit Office</SourceLink></p>
              <div className="mt-6 rounded-3xl bg-[linear-gradient(135deg,var(--brand-strong),var(--brand))] p-6 text-white"><p className="text-2xl font-bold tracking-tight sm:text-3xl">Do not pay anyone for a driving test swap.</p></div>
              <p className="mt-6 text-sm leading-6 text-slate-700">MoveMyTest is free. We are not building this to sell tests or profit from learners who are already under pressure. A swap should be fair, learner-to-learner, and not another marketplace for profiteers.</p>
            </section>

            <section id="why-rules-changed" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Why the DVSA changed the rules</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">From <strong>12 May 2026</strong>, only the learner driver can book and manage their own car driving test. DVSA says this change is part of a crackdown on exploitation by third-party services, including unofficial booking services, cancellation finders and driving instructors making bookings for someone else. <SourceLink href="https://www.gov.uk/government/news/end-of-the-road-for-unofficial-driving-test-booking-services">Source: GOV.UK</SourceLink></p>
              <p className="mt-4 text-sm leading-6 text-slate-700">DVSA has also reminded learners that they should only pay the official fee: <strong>£62 for weekday tests</strong> and <strong>£75 for evening, weekend and bank holiday tests</strong>.</p>
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950"><strong>But genuine learners still need help.</strong> That is where MoveMyTest comes in.</div>
            </section>

            <section id="what-we-do" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">What MoveMyTest does</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">MoveMyTest helps learners find another learner who may want to exchange an existing test booking, while keeping the process calmer, more private and easier for instructors to support.</p>
              <div className="mt-5 grid gap-3">
                {["We do not book your test for you.", "We do not change your test for you.", "We do not sell test slots.", "We do not charge you to find a swap.", "We are not DVSA, DVLA, DVA, nidirect or GOV.UK."].map((item) => <div key={item} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">{item}</div>)}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-700">We simply help connect learners who already have a booked test and may be able to help each other, without turning the process into a paid marketplace or a data-sharing gamble.</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">The official swap must still be completed through DVSA. DVSA guidance says a driving test swap is when two learners exchange existing bookings, and that the swap can only be done by phone. It cannot be completed online, by email, webchat, text message, WhatsApp or social media. <SourceLink href="https://www.gov.uk/guidance/swapping-your-driving-test-with-another-learner-driver">Source: GOV.UK DVSA swap guidance</SourceLink></p>
            </section>

            <section id="how-it-works" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">How a test swap works</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">A driving test swap is not the same as finding a new cancellation. You are not buying a slot, jumping a queue or paying someone for access.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[["1", "Add your test", "Tell us the test centre, date and time you already have, plus the dates or centres that would suit you better."], ["2", "Find a learner match", "We look for another learner who wants your exact slot and has a slot that works for you."], ["3", "Complete it with DVSA", "Both learners agree, then the official swap is completed by phone through DVSA."]].map(([number, title, text]) => (
                  <div key={number} className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">{number}</span><h3 className="mt-4 font-semibold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>
                ))}
              </div>
              <h3 className="mt-8 text-xl font-semibold text-slate-950">DVSA swap rules learners need to know</h3>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
                <li>Both learners must already have a practical car driving test booked.</li>
                <li>Both learners must want each other’s exact test date, time and test centre.</li>
                <li>Both learners must agree to the swap.</li>
                <li>Both learners must have at least one of their two allowed changes remaining.</li>
                <li>The swap must be requested at least 10 full working days before the earliest of the two tests.</li>
                <li>From 9 June 2026, each learner can only swap with someone whose test is at the same centre, one of the three nearest centres, or the test centre they first booked at. The rule must work for both learners.</li>
              </ol>
            </section>

            <section id="safety" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Learner privacy and safety come first</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">Learners should be extremely careful with personal information. DVSA has warned that it does not run, approve or endorse cancellation finder apps or services, and has warned about unofficial websites and apps. <SourceLink href="https://www.gov.uk/government/news/learner-drivers-warned-about-the-risks-of-driving-test-cancellation-finders">Source: GOV.UK</SourceLink></p>
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900"><AlertTriangle className="mb-2 h-5 w-5" /><strong>Never share your driving licence number, theory test certificate number, address, payment card details, GOV.UK login details or full personal information with another learner.</strong></div>
              <p className="mt-5 text-sm leading-6 text-slate-700">DVSA says that, for an official phone swap, the learner who calls DVSA will need the other learner’s booking reference number, but DVSA will never ask for the full payment card number or security code. MoveMyTest keeps public pages aggregate-only and delays sensitive disclosure until both learners are ready for the official process.</p>
            </section>

            <section id="why-we-care" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">We are doing this because we care about our learners</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">We have sat with learners who were ready but could not get a test. We have watched pupils lose momentum because they had to wait months, and seen families rearrange work, childcare and transport around a test date that should have been easier to access.</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">Driving lessons are already a major cost. RAC guidance says learners can expect lessons to cost roughly <strong>£25 to £45 per hour</strong>, with many learners needing around <strong>45 hours of lessons</strong> before a practical test. <SourceLink href="https://www.rac.co.uk/drive/advice/learning-to-drive/how-much-does-it-cost-to-learn-to-drive/">Source: RAC</SourceLink></p>
              <p className="mt-4 text-sm leading-6 text-slate-700">We do not think learners should be punished twice: once by the backlog, and again by people charging inflated fees to “solve” it.</p>
            </section>

            <section id="promise" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Our promise</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">MoveMyTest will be free. Always.</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">We will never charge learners to use it. We will never ask for a success fee. We will never sell test swaps. We will never encourage learners to pay someone else for a swap.</p>
              <div className="mt-6 rounded-3xl bg-[linear-gradient(135deg,var(--brand-strong),var(--brand))] p-6 text-white"><p className="text-2xl font-bold tracking-tight sm:text-3xl">Do not pay for a driving test swap.</p></div>
              <p className="mt-6 text-sm leading-6 text-slate-700">Use the official DVSA process. Stay safe with your personal details. Make sure you are test-ready. Check that your instructor is available. If another learner genuinely wants your slot while you genuinely want theirs, MoveMyTest is here to help you find each other fairly without giving away control.</p>
            </section>

            <section id="faq" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Frequently asked questions</h2>
              <div className="mt-6 divide-y divide-slate-200">
                {faqs.map((faq) => <details key={faq.question} className="py-5 first:pt-0"><summary className="cursor-pointer font-semibold text-slate-950">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p></details>)}
              </div>
            </section>

            <section id="sources" className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">Sources and useful guidance</h2>
              <p className="mt-4 text-sm leading-6 text-slate-700">This page has been written using public guidance and reporting from official and recognised sources.</p>
              <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-700">
                {sourceLinks.map(([label, href]) => <li key={href}><SourceLink href={href}>{label}</SourceLink></li>)}
              </ol>
            </section>

            <section className="rounded-3xl bg-[linear-gradient(135deg,var(--brand-strong),var(--brand))] p-8 text-center text-white shadow-sm">
              <h2 className="text-3xl font-bold tracking-tight">Start your free test swap search</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-200">Already have a practical driving test booked? Add your test details, tell us what dates or centres would work better for you, and we will help look for compatible learners.</p>
              <Link href="/start" className="mt-6 inline-flex rounded-full border border-white bg-white px-6 py-3 text-sm font-semibold !text-[var(--brand-strong)] transition hover:bg-[var(--brand-strong)] hover:!text-white">Find a free test swap</Link>
            </section>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-[var(--brand)]" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">MoveMyTest</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">A free learner-to-learner matching service with private match rooms. The official swap must be completed by the learner through DVSA on {DVSA_SWAP_PHONE}.</p>
              <Link href="/start" className="mt-5 inline-flex w-full justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold !text-white hover:bg-[var(--brand-strong)]">Start for free</Link>
            </section>
            <section className="rounded-3xl border border-slate-300 bg-slate-50 p-6 shadow-sm">
              <LockKeyhole className="h-8 w-8 text-[var(--brand)]" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">Remember</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                <li>Do not pay for a swap.</li>
                <li>Do not share licence details.</li>
                <li>Do not share card details.</li>
                <li>Do not share GOV.UK login details.</li>
                <li>MoveMyTest is independent from DVSA.</li>
              </ul>
            </section>
            <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">On this page</h2>
              <nav className="mt-4 grid gap-2 text-sm text-slate-700">
                {[ ["The test shortage", "#problem"], ["Bots and resellers", "#bots-and-resellers"], ["What MoveMyTest does", "#what-we-do"], ["How swaps work", "#how-it-works"], ["Learner safety", "#safety"], ["FAQs", "#faq"] ].map(([label, href]) => <a key={href} href={href} className="hover:text-[var(--brand)]">{label}</a>)}
              </nav>
            </section>
          </aside>
        </section>
      </main>
    </>
  );
}
