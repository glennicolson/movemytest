import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ExternalLink, MapPin, Navigation } from "lucide-react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, faqSchema } from "@/components/seo/schemas";
import { TEST_CENTRE_PASS_RATE_SOURCE } from "@/features/movemytest/generated/pass-rate-data";
import { getRegionOrCentreBySlug, getMoveMyTestDirectorySummary } from "@/features/movemytest/queries";

type PageProps = { params: Promise<{ slug: string }> };

function formatPassRate(rate?: { passRate: number }) {
  return rate ? `${rate.passRate.toFixed(1)}%` : "Data pending";
}

function formatCount(value?: number) {
  if (!value) return "No matched DVSA data";
  return value.toLocaleString("en-GB");
}

function formatAddressLines(value: unknown) {
  return Array.isArray(value) ? value.filter((line): line is string => typeof line === "string" && line.trim().length > 0) : [];
}

function coordinateValue(value: unknown) {
  if (value == null) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getRegionOrCentreBySlug(slug);
  if (!data) return { title: "Test swap centre not found" };
  if (data.kind === "region") {
    return {
      title: `${data.region.name} Driving MoveMyTests`,
      description: `Browse practical driving test centres in ${data.region.name} by county, with aggregate MoveMyTest listing counts and DVSA pass-rate context where available.`,
      alternates: { canonical: `/test-centres/${slug}` },
    };
  }
  return {
    title: `${data.centre.name} Driving MoveMyTests`,
      description: `Find learner-to-learner practical driving test swap matches for ${data.centre.name}. Public centre pages show aggregate counts only.`,
    alternates: { canonical: `/test-centres/${slug}` },
  };
}

export async function generateStaticParams() {
  try {
    const { centres, regions } = await getMoveMyTestDirectorySummary();
    return [...regions.map((region) => ({ slug: region.slug })), ...centres.map((centre) => ({ slug: centre.slug }))];
  } catch {
    return [];
  }
}

export default async function MoveMyTestCentreOrRegionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getRegionOrCentreBySlug(slug);
  if (!data) notFound();

  if (data.kind === "region") {
    const countyGroups = data.region.countySummaries.map((county) => ({
      ...county,
      centres: data.centres.filter((centre) => centre.locality.countySlug === county.countySlug),
    }));
    const faqs = [
      { question: `Can I find swaps in ${data.region.name}?`, answer: `You can list your test and MoveMyTest will look for compatible learners using your selected centres, dates, test type and DVSA rules.` },
      { question: "Are learner details public?", answer: "No. Public pages show aggregate counts only, not names, contact details or exact listing details." },
      { question: "Does MoveMyTest guarantee a swap?", answer: "No. MoveMyTest can only help identify possible peer-to-peer matches." },
      { question: "How does the official swap happen?", answer: "Both learners complete the official process by phone with DVSA after accepting a compatible match." },
      { question: "What if this is a Northern Ireland centre?", answer: "Northern Ireland tests are managed by DVA/nidirect. NI directory pages are visible, but live swap matching is disabled unless DTC enables DVA support." },
      { question: "What details should I keep private?", answer: "Never share licence numbers, theory certificate numbers, home address, card details or GOV.UK login details with another learner." },
    ];
    return (
      <>
        <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "MoveMyTest", href: "/" }, { name: "Test centres", href: "/test-centres" }, { name: data.region.name, href: `/test-centres/${slug}` }])} />
        <JsonLd data={faqSchema([{ category: `${data.region.name} test swap FAQs`, items: faqs }])} />
        <main className="bg-white">
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Regional directory</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">{data.region.name} driving test swaps</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">Browse centres in {data.region.name} by county or local authority area. Counties are ordered by population where available, with cumulative practical car pass-rate figures calculated from DVSA centre totals.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><strong className="text-2xl text-slate-950">{data.region.centreCount}</strong><p className="text-sm text-slate-600">test centres</p></div>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><strong className="text-2xl text-slate-950">{formatPassRate(data.region.aggregatePassRate)}</strong><p className="text-sm text-slate-600">regional DVSA pass rate</p></div>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><strong className="text-2xl text-slate-950">{formatCount(data.region.aggregatePassRate?.conducted)}</strong><p className="text-sm text-slate-600">tests in source period</p></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Source: {TEST_CENTRE_PASS_RATE_SOURCE.title}, {TEST_CENTRE_PASS_RATE_SOURCE.period}, updated {TEST_CENTRE_PASS_RATE_SOURCE.updated}. Low-volume centre and county figures should be treated with caution.</p>
          </section>
          <section className="border-y border-slate-200 bg-slate-50 py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-slate-950">Counties and local areas in {data.region.name}</h2>
              <div className="mt-8 space-y-6">
                {countyGroups.map((county) => (
                  <section key={county.countySlug} className="rounded-3xl border border-slate-300 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand)]"><MapPin className="h-4 w-4" /> {county.countyPopulation ? `${county.countyPopulation.toLocaleString("en-GB")} population` : "County/local area"}</div>
                        <h3 className="mt-2 text-2xl font-bold text-slate-950">{county.county}</h3>
                        <p className="mt-2 text-sm text-slate-600">{county.centreCount} centres · {county.activeSwapCount} active swaps · {formatCount(county.aggregatePassRate?.conducted)} DVSA tests in source period</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-emerald-900">
                        <div className="flex items-center gap-2 text-sm font-semibold"><BarChart3 className="h-4 w-4" /> Cumulative pass rate</div>
                        <div className="mt-1 text-2xl font-bold">{formatPassRate(county.aggregatePassRate)}</div>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {county.centres.map((centre) => (
                        <Link key={centre.id} href={`/test-centres/${centre.slug}`} className="group rounded-2xl border border-slate-300 bg-white p-5 shadow-sm hover:shadow-md">
                          <h4 className="font-semibold text-slate-950">{centre.name}</h4>
                          <p className="mt-1 text-sm text-slate-600">{centre.postcode ?? "Postcode not imported"} · UK</p>
                          <p className="mt-3 text-sm text-slate-700">{(centre.activeSwapCount ?? 0) > 0 ? `${centre.activeSwapCount} active swap listings` : "No active swaps here yet. Add your test and we'll let you know when a compatible learner appears."}</p>
                          <span className="mt-3 inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white group-hover:border-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white">{formatPassRate(centre.passRate)} pass rate</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>
          <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-950">{data.region.name} FAQs</h2>
            <div className="mt-5 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">{faqs.map((faq) => <details key={faq.question} className="p-5"><summary className="cursor-pointer font-semibold">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p></details>)}</div>
            <Link href="/ready_to_pass" className="mt-8 inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold">Explore MoveMyTest Ready to Pass resources</Link>
          </section>
        </main>
      </>
    );
  }

  const centre = data.centre;
  const addressLines = formatAddressLines(centre.addressLine1 ? [centre.addressLine1] : []);
  const latitude = coordinateValue(centre.latitude);
  const longitude = coordinateValue(centre.longitude);
  const hasCoordinates = latitude !== null && longitude !== null && !(latitude === 0 && longitude === 0);
  const fullAddress = [...addressLines, centre.postcode].filter(Boolean).join(", ");
  const mapQuery = encodeURIComponent(hasCoordinates ? `${latitude},${longitude}` : fullAddress || centre.name);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const openStreetMapUrl = hasCoordinates ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}` : `https://www.openstreetmap.org/search?query=${mapQuery}`;
  const osmEmbedUrl = hasCoordinates ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.006}%2C${longitude + 0.01}%2C${latitude + 0.006}&layer=mapnik&marker=${latitude}%2C${longitude}` : null;
  const faqs = [
    { question: `Are there active swaps at ${centre.name}?`, answer: (centre.activeSwapCount ?? 0) > 0 ? `There are ${centre.activeSwapCount} aggregate active listings for this centre.` : "No active swaps here yet. Add your test and MoveMyTest will let you know when a compatible learner appears." },
    { question: "Will MoveMyTest show my details publicly?", answer: "No. Public centre pages only show aggregate counts and safe summary information." },
    { question: "Can DTC complete the official swap?", answer: "No. MoveMyTest only facilitates matching. Learners complete the official swap by phone with DVSA where applicable." },
    { question: "What centres are nearby?", answer: "Where official source data includes neighbour relationships, MoveMyTest shows nearby centres used for compatibility checks from 9 June 2026." },
    { question: "Does this page show pass rates?", answer: "No pass rates or test volumes are shown unless imported from official DVSA datasets with a source date." },
    { question: "What if this is a DVA centre?", answer: "Northern Ireland practical tests are managed by DVA/nidirect. MoveMyTest's live swap workflow currently supports DVSA car tests in England, Scotland and Wales unless NI support is enabled." },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "MoveMyTest", href: "/" }, { name: "Test centres", href: "/test-centres" }, { name: centre.name, href: `/test-centres/${slug}` }])} />
      <JsonLd data={faqSchema([{ category: `${centre.name} test swap FAQs`, items: faqs }])} />
      <main className="bg-white">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Centre directory</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">{centre.name} test swaps</h1>
            <p className="mt-5 text-lg leading-8 text-slate-700">Find learner-to-learner practical driving test swap matches for this centre. MoveMyTest shows only aggregate public information until learners are inside a private match room.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><strong className="text-2xl text-slate-950">{formatPassRate(centre.passRate)}</strong><p className="text-sm text-slate-600">DVSA pass rate</p></div>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><strong className="text-2xl text-slate-950">{formatCount(centre.passRate?.conducted)}</strong><p className="text-sm text-slate-600">tests in source period</p></div>
              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><strong className="text-2xl text-slate-950">{centre.locality.county}</strong><p className="text-sm text-slate-600">county// local area</p></div>
            </div>
            <p className="mt-4 text-xs text-slate-500">Source: {TEST_CENTRE_PASS_RATE_SOURCE.title}, {TEST_CENTRE_PASS_RATE_SOURCE.period}, updated {TEST_CENTRE_PASS_RATE_SOURCE.updated}. Pass rates are public historic statistics, not a prediction or guarantee.</p>
            <div className="mt-8 rounded-3xl border border-slate-300 bg-slate-50 p-6">
              <h2 className="text-xl font-semibold text-slate-950">How the swap works here</h2>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700"><li>1. List your existing booking and desired dates.</li><li>2. MoveMyTest checks whether another learner wants your exact slot and you want theirs.</li><li>3. Both learners accept, then complete the official DVSA phone process.</li></ol>
            </div>
            <div className="mt-8 rounded-3xl border border-slate-300 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-950">Local tips</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">Check your instructor is available for the date and time you want to swap to, allow time to arrive calmly, and make sure the phone number on your official booking is current before any DVSA call.</p>
            </div>
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]"><MapPin className="h-4 w-4" /> Centre location</div>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950">Where to find {centre.name}</h2>
                  {addressLines.length || centre.postcode ? (
                    <address className="mt-4 not-italic text-sm leading-6 text-slate-700">
                      {addressLines.map((line) => <span key={line} className="block">{line}</span>)}
                      {centre.postcode ? <span className="block font-semibold text-slate-950">{centre.postcode}</span> : null}
                    </address>
                  ) : <p className="mt-4 text-sm leading-6 text-slate-600">Address data is being verified for this centre.</p>}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:!text-white"><Navigation className="h-4 w-4" /> Open in Google Maps</a>
                    <a href={openStreetMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:!text-white"><ExternalLink className="h-4 w-4" /> OpenStreetMap</a>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">Practice planning around {centre.postcode ? `${centre.postcode.split(" ")[0]} and nearby routes` : centre.locality.county}. Always check your official DVSA/DVA booking confirmation before travelling, as centre access instructions can change.</p>
                </div>
                <div className="min-h-[260px] bg-slate-100">
                  {osmEmbedUrl ? (
                    <iframe title={`${centre.name} map`} src={osmEmbedUrl} className="h-full min-h-[260px] w-full border-0" loading="lazy" />
                  ) : (
                    <div className="flex h-full min-h-[260px] items-center justify-center p-6 text-center text-sm text-slate-500">Map coordinates are being verified for this centre.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-300 bg-white p-6 text-slate-950 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">At a glance</h2>
              <dl className="mt-4 space-y-3 text-sm"><div><dt className="text-slate-500">Active swaps</dt><dd className="font-semibold text-slate-950">{centre.activeSwapCount}</dd></div><div><dt className="text-slate-500">Pass rate</dt><dd>{formatPassRate(centre.passRate)}</dd></div><div><dt className="text-slate-500">County// local area</dt><dd>{centre.locality.county}</dd></div><div><dt className="text-slate-500">Region</dt><dd>{centre.region}</dd></div><div><dt className="text-slate-500">Postcode</dt><dd>{centre.postcode ?? "Not imported"}</dd></div><div><dt className="text-slate-500">Status</dt><dd>DVSA / GB live matching</dd></div></dl>
              <Link href={`/start?centre=${encodeURIComponent(centre.name)}`} className="mt-6 inline-flex w-full justify-center rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold !text-white visited:!text-white transition hover:bg-[var(--brand-strong)] hover:!text-white">List your test here</Link>
            </div>
            <div className="rounded-3xl border border-slate-300 bg-slate-50 p-6">
              <h2 className="font-semibold text-slate-950">Nearby centres</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {data.nearby.length > 0 ? (
                  data.nearby.map((nearby) => (
                    <li key={nearby.id} className="flex items-center justify-between">
                      <Link 
                        href={`/test-centres/${nearby.slug}`} 
                        className="font-medium text-[var(--brand)] hover:underline"
                      >
                        {nearby.name}
                      </Link>
                      <span className="text-xs text-slate-500">
                        {nearby.distanceMiles} miles
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">No other centres within 25 miles.</li>
                )}
              </ul>
            </div>
          </aside>
        </section>
        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8"><h2 className="text-2xl font-bold text-slate-950">FAQs</h2><div className="mt-5 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">{faqs.map((faq) => <details key={faq.question} className="p-5"><summary className="cursor-pointer font-semibold">{faq.question}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p></details>)}</div><div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">MoveMyTest is not DVSA, DVLA, DVA, nidirect or GOV.UK. MoveMyTest does not change, cancel or swap tests for learners.</div></section>
      </main>
    </>
  );
}
