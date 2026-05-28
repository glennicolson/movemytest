import Link from "next/link";

const resourceLinks = [
  {
    title: "Apply for your first provisional licence",
    href: "/learner-help/provisional-licence",
  },
  {
    title: "Book your theory test",
    href: "/learner-help/theory-test",
  },
  {
    title: "Book your driving test",
    href: "/learner-help/driving-test",
  },
];

export function HomeResourcePreview() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-900">Helpful learner resources, not just sales pages</h2>
          <p className="mt-3 text-lg leading-relaxed text-slate-600">
            MoveMyTest should be useful before someone even books. Learner help builds trust, supports search visibility, and gives people a better first experience.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {resourceLinks.map((item) => (
            <Link key={item.href} href={item.href as "/"} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[var(--brand)] hover:shadow-md">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <div className="mt-3 text-sm font-medium text-[var(--brand)]">Read guide</div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/learner-help" className="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
            Explore learner help
          </Link>
        </div>
      </div>
    </section>
  );
}
