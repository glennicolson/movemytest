import Link from "next/link";

const audienceCards = [
  {
    title: "Learning to drive",
    description: "Manual and automatic lessons, theory and practical support, and a calmer route to becoming a confident driver.",
    href: "/driving-lessons",
    cta: "Explore driving lessons",
  },
  {
    title: "Becoming an instructor",
    description: "Join MoveMyTest with stronger local support, learner demand, and a more personal alternative to the big franchise model.",
    href: "/become-an-instructor",
    cta: "Explore instructor opportunities",
  },
];

export function HomeJourneySplit() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-bold text-slate-900">Let MoveMyTest help you on your journey</h2>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          The site should work just as hard for learner drivers as it does for future instructors. These are two important growth paths, and both deserve clear routes forward.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {audienceCards.map((card) => (
          <div key={card.href} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.description}</p>
            <Link href={card.href as "/"} className="mt-6 inline-flex rounded-lg bg-[var(--brand)] px-5 py-3 text-sm font-semibold !text-white no-underline transition hover:bg-[var(--brand-strong)] hover:!text-white visited:!text-white">
              {card.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
