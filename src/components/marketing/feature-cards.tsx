const features = [
  {
    title: "DVSA-Approved Instructors",
    description: "Only certified ADIs give you licence-ready education. No trainee instructors.",
  },
  {
    title: "Manual & Automatic",
    description: "Choose the car that matches your future driving needs. No compromise.",
  },
  {
    title: "Wide Geographic Reach",
    description: "Edinburgh, Musselburgh, Dalkeith, Currie, Dumfries, Dunbar, Lockerbie and many towns in between.",
  },
  {
    title: "Modern, Reliable Vehicles",
    description: "Practise in up-to-date cars that reflect what you'll be driving after the licence.",
  },
  {
    title: "Diverse Language Support",
    description: "English, Polish, Urdu, Punjabi. Learn in the language that keeps you comfortable.",
  },
  {
    title: "Tailored Lesson Plans",
    description: "Every session is customised to your learning style, pace, and the exact test routes you'll face.",
  },
  {
    title: "Real-World Confidence",
    description: "From roundabouts to steep Edinburgh hills, we prepare you for every scenario you'll meet.",
  },
  {
    title: "Post-Licence Support",
    description: "Refresher lessons, advanced driving courses, and continued support after you pass.",
  },
];

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-3xl font-bold text-slate-900">Why MoveMyTest Is Your Ideal Partner</h2>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Fully-qualified instructors, flexible lesson types, and a personalised approach that gets you test-ready with real confidence.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[var(--brand)] hover:shadow-md"
          >
            <h3 className="font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}