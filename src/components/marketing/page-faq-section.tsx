import { JsonLd } from "@/components/seo/json-ld";
import { faqSchema } from "@/components/seo/schemas";

interface FaqItem {
  question: string;
  answer: string;
}

interface PageFaqSectionProps {
  title?: string;
  faqs: FaqItem[];
}

export function PageFaqSection({ title = "Frequently asked questions", faqs }: PageFaqSectionProps) {
  return (
    <>
      <JsonLd data={faqSchema([{ category: title, items: faqs }])} />
      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((item) => (
            <details key={item.question} className="group rounded-xl border border-slate-100 bg-slate-50">
              <summary className="cursor-pointer px-5 py-3.5 text-sm font-medium text-slate-900 transition hover:text-[var(--brand)]">
                {item.question}
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed text-slate-600">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
