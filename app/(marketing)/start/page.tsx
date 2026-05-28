import type { Metadata } from "next";
import Link from "next/link";
import { MoveMyTestAccountNav } from "@/components/movemytest/movemytest-account-nav";
import { MoveMyTestListingForm } from "@/components/movemytest/movemytest-listing-form";
import { requireReadyMoveMyTestSession } from "@/features/movemytest/session";
import { getActiveTestCentres } from "@/features/movemytest/queries";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "Start a Free MoveMyTest Listing",
  description: "Create a private MoveMyTest listing with the minimum details needed to find compatible learner-to-learner practical car test swaps.",
  robots: { index: false, follow: false },
};

export default async function MoveMyTestStartPage({
  searchParams,
}: {
  searchParams?: Promise<{ centre?: string }>;
}) {
  const session = await requireReadyMoveMyTestSession("/start");
  const params = await searchParams;
  const prefillCentre = params?.centre ? decodeURIComponent(params.centre) : undefined;
  const existingListing = await prisma.listing.findFirst({
    where: { accountId: session.accountId, status: { in: ["ACTIVE", "PAUSED", "MATCHED"] } },
    include: { currentCentre: true },
    orderBy: { createdAt: "desc" },
  });
  const centres = existingListing ? [] : await getActiveTestCentres();

// Check if learner was invited by an instructor — auto-fill ADI if so
  const instructorInvite = await prisma.learnerInvite.findFirst({
    where: { claimedByAccountId: session.accountId, instructorAdiNumber: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { instructorAdiNumber: true },
  });

// Check if learner previously had an instructor linked — carry over to new listing
  const previousInstructor = instructorInvite ? null : await prisma.listingInstructor.findFirst({
    where: {
      listing: { accountId: session.accountId },
      adiNumber: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { adiNumber: true },
  });

  const prefillAdi = instructorInvite?.instructorAdiNumber ?? previousInstructor?.adiNumber ?? undefined;

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Secure learner form</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">Create your free test swap listing</h1>
        <MoveMyTestAccountNav active="start" className="mt-6" />
        {existingListing ? (
          <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-blue-950">
            <h2 className="text-xl font-semibold">You already have a MoveMyTest listing</h2>
            <p className="mt-2 text-sm leading-6">
              Your current listing is for {existingListing.currentCentre.name} on {existingListing.currentDateTime.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })}. Manage it from your dashboard before creating another listing.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--brand-strong)]">Go to dashboard</Link>
              <Link href="/support-us" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white">Support MoveMyTest</Link>
            </div>
          </div>
        ) : null}
        {!existingListing ? <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">We only ask for details needed to match your existing practical car test with another learner. Do not enter licence numbers, theory certificate numbers, home address, card details or GOV.UK login details.</p> : null}
        {!existingListing ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
          <h2 className="font-semibold">Before you start — have these ready:</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Your DVSA booking confirmation email</li>
            <li>The exact test centre name, date, and time</li>
            <li>Your DVSA booking reference — optional but recommended</li>
          </ul>
        </div> : null}
        {!existingListing ? <div className="mt-8"><MoveMyTestListingForm prefillCentre={prefillCentre} prefillAdiNumber={prefillAdi} centres={centres.map((centre) => ({
          id: centre.id,
          displayName: centre.name,
          region: centre.region,
          country: centre.region ? "UK" : null,
          postcode: centre.postcode,
          latitude: centre.latitude ? Number(centre.latitude) : null,
          longitude: centre.longitude ? Number(centre.longitude) : null,
          nearestCentres: [], // Neighbour lookup not available in standalone schema
        }))} /></div> : null}
      </section>
    </main>
  );
}
