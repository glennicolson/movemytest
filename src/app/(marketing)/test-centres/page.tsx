import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, MapPin } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/components/seo/schemas";
import { TEST_CENTRE_PASS_RATE_SOURCE } from "@/features/movemytest/generated/pass-rate-data";
import { getMoveMyTestDirectorySummary } from "@/features/movemytest/queries";
import { CentreSearchAutocomplete, type CentreSearchItem } from "@/components/movemytest/centre-search-autocomplete";
import { NearestCentresByLocation } from "@/components/movemytest/nearest-centres-by-location";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Driving MoveMyTest Test Centres Directory",
  description: "Browse MoveMyTest centres by region, county, centre name, town, city or postcode, with DVSA practical car pass-rate context where available.",
  alternates: { canonical: "http://localhost:6003/test-centres" },
  openGraph: {
    title: "Driving MoveMyTest Test Centres Directory",
    description: "Browse all UK driving test centres for MoveMyTest by region, with DVSA pass-rate context where available.",
    url: "/test-centres",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Driving MoveMyTest Test Centres Directory",
    description: "Browse all UK driving test centres for MoveMyTest by region, with DVSA pass-rate context.",
    images: ["/opengraph-image"],
  },
};

function formatPassRate(rate?: { passRate: number }) {
  return rate ? `${rate.passRate.toFixed(1)}%` : "Data pending";
}

export default async function MoveMyTestCentresPage() {
  const { centres, regions } = await getMoveMyTestDirectorySummary();

  const searchItems: CentreSearchItem[] = centres.map((centre) => ({
    id: centre.id,
    slug: centre.slug,
    displayName: centre.name,
    region: centre.region,
    postcode: centre.postcode ?? null,
  }));

  // Build A-Z from first letters of displayName, ascending
  const firstLetters = Array.from(new Set(centres.map((centre) => {
    const first = centre.name.charAt(0).toUpperCase();
    return /[A-Z]/.test(first) ? first : "#";
  }))).sort((a, b) => a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b));

  // Group "All centres" by first letter
  const grouped = centres.reduce<Record<string, typeof centres>>((acc, centre) => {
    const first = centre.name.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : "#";
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(centre);
    return acc;
  }, {});

  const totalConducted = centres.reduce((sum, centre) => sum + (centre.passRate?.conducted ?? 0), 0);
  const totalPasses = centres.reduce((sum, centre) => sum + (centre.passRate?.passes ?? 0), 0);
  const overallPassRate = totalConducted > 0 ? Math.round((totalPasses / totalConducted) * 1000) / 10 : 0;

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", href: "/" }, { name: "MoveMyTest", href: "/" }, { name: "Test centres", href: "/test-centres" }])} />
      <main className="bg-white">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Test centre directory</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">Browse driving test swap centres</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">Search by centre, town, city, postcode, county or region. Start typing and matching centres appear instantly — no page reload needed. Regions are ordered by likely population demand.</p>

          <div className="mt-8">
            <CentreSearchAutocomplete centres={searchItems} searchPlaceholder="Search by centre name, town or postcode…" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><strong className="text-2xl text-slate-950">{centres.length}</strong><p className="text-sm text-slate-600">listed centres</p></div>
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><strong className="text-2xl text-slate-950">{regions.length}</strong><p className="text-sm text-slate-600">regions and counties</p></div>
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5"><strong className="text-2xl text-slate-950">{overallPassRate.toFixed(1)}%</strong><p className="text-sm text-slate-600">GB practical pass rate in matched DVSA data</p></div>
          </div>
          <p className="mt-4 text-xs text-slate-500">Source: {TEST_CENTRE_PASS_RATE_SOURCE.title}, {TEST_CENTRE_PASS_RATE_SOURCE.period}, updated {TEST_CENTRE_PASS_RATE_SOURCE.updated}. Low-volume centre figures should be treated with caution.</p>

          {/* Find nearby centres — uses device geolocation */}
          <div className="mt-8">
            <NearestCentresByLocation
              centres={centres.map((centre) => ({
                id: centre.id,
                slug: centre.slug,
                displayName: centre.name,
                region: centre.region,
                postcode: centre.postcode ?? null,
                latitude: centre.latitude ? Number(centre.latitude) : null,
                longitude: centre.longitude ? Number(centre.longitude) : null,
                activeSwapCount: centre.activeSwapCount ?? 0,
                passRateLabel: centre.passRate?.passRate
                  ? `${centre.passRate.passRate.toFixed(1)}% pass rate`
                  : undefined,
              }))}
            />
          </div>
        </section>

        {/* A-Z quick links */}
        <section className="border-t border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Jump to letter</p>
            <div className="flex flex-wrap justify-center gap-1">
              {firstLetters.map((letter) => (
                <a key={letter} href={`#a-z-${letter}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-slate-700 hover:bg-[var(--brand)] hover:text-white">
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-950">Browse by region, ordered by population demand</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regions.map((region) => (
                <Link key={region.slug} href={`/test-centres/${encodeURIComponent(region.slug)}`} className="group rounded-3xl border border-slate-300 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <MapPin className="h-7 w-7 text-[var(--brand)]" />
                    <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white group-hover:border-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white">{region.displayMeta?.populationLabel ?? "Population sorted"}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{region.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{region.centreCount} centres · {region.countySummaries.length} counties/areas · {region.activeSwapCount} active swaps</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-900"><BarChart3 className="h-4 w-4 text-[var(--brand)]" /> {formatPassRate(region.aggregatePassRate)} regional pass rate</div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">Top areas: {region.countySummaries.slice(0, 4).map((county) => county.county).join(", ") || region.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-950">All centres</h2>
          {firstLetters.map((letter) => (
            <div key={letter} id={`a-z-${letter}`} className="scroll-mt-24">
              <h3 className="mt-10 border-b border-slate-200 pb-2 text-2xl font-bold text-slate-950">{letter}</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(grouped[letter] ?? []).map((centre) => (
                  <Link key={centre.id} href={`/test-centres/${centre.slug}`} className="group rounded-2xl border border-slate-300 bg-white p-5 shadow-sm hover:shadow-md">
                    <h3 className="font-semibold text-slate-950">{centre.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{centre.locality.county} · {centre.region} · {centre.postcode ?? "Postcode not imported"}</p>
                    <p className="mt-3 text-sm text-slate-700">{(centre.activeSwapCount ?? 0) > 0 ? `${centre.activeSwapCount} learners looking to swap` : "No active swaps here yet."}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white group-hover:border-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white">
                        DVSA / GB live matching
                      </span>
                      <span className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white group-hover:border-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white">
                        {formatPassRate(centre.passRate)} pass rate
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">MoveMyTest is not DVSA, DVLA, DVA, nidirect or GOV.UK. MoveMyTest only facilitates peer-to-peer matching; learners complete any official swap through the relevant official process. Pass rates are public DVSA statistics and are not a guarantee of individual test outcome.</div>
        </section>
      </main>
    </>
  );
}
