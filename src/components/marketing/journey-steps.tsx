const steps = [
  {
    number: "1",
    title: "Book Your Intro Lesson",
    description: "Block lesson discount gets you on the road without breaking the bank.",
  },
  {
    number: "2",
    title: "Custom Lesson Plan",
    description: "Your ADI designs a schedule covering manual or automatic, based on your preference.",
  },
  {
    number: "3",
    title: "Theory & Practical Prep",
    description: "From DVSA apps to mock tests, we help you pass the theory then focus on practical manoeuvres.",
  },
  {
    number: "4",
    title: "Test-Ready Confidence",
    description: "Simulated driving tests, real-time feedback, and targeted skill drills ensure you're ready on day one.",
  },
  {
    number: "5",
    title: "Post-Licence Support",
    description: "Refresher lessons, advanced driving courses, and continued support whenever you need it.",
  },
];

export function JourneySteps() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold text-slate-900">How MoveMyTest Fits Into Your Driving Journey</h2>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          From first lesson to full licence and beyond — a structured path designed around you.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-5">
          {steps.map((step) => (
            <div key={step.number} className="relative rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)] text-lg font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}