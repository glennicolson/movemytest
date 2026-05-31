import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { updateMoveMyTestLearnerRecordAction } from "@/features/movemytest/actions";
import { TEST_TYPE_LABELS, TIME_PREFERENCE_LABELS } from "@/features/movemytest/constants";
import { AutoDirectionEditField } from "@/components/movemytest/auto-direction-edit-field";
import { CentrePicker } from "@/components/movemytest/centre-picker";

function formatInputDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatInputTime(value: Date) {
  return value.toISOString().slice(11, 16);
}

function desiredCentreIds(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function StatusMessage({ status }: { status?: string }) {
  if (!status) return null;
  const messages: Record<string, { text: string; tone: string }> = {
    updated: { text: "MoveMyTest record updated.", tone: "border-emerald-200 bg-emerald-50 text-emerald-800" },
    invalid: { text: "Check the record fields and try again.", tone: "border-red-200 bg-red-50 text-red-800" },
    centre: { text: "Choose a valid test centre.", tone: "border-red-200 bg-red-50 text-red-800" },
  };
  const message = messages[status];
  if (!message) return null;
  return <p className={`rounded-2xl border p-4 text-sm font-semibold ${message.tone}`}>{message.text}</p>;
}

async function getNearestCentres(centreId: string | null | undefined, limit = 10) {
  if (!centreId) return [];
  // Get the source centre
  const centre = await prisma.testCentre.findUnique({
    where: { id: centreId },
    select: { latitude: true, longitude: true },
  });
  if (!centre?.latitude || !centre?.longitude) return [];

  // Find nearby centres using distance (simplified)
  const allCentres = await prisma.testCentre.findMany({
    where: {
      NOT: { id: centreId },
      latitude: { not: null },
      longitude: { not: null },
    },
    select: { id: true, name: true, region: true, postcode: true, latitude: true, longitude: true },
  });

  // Calculate distances and sort
  return allCentres
    .map((c: any) => {
      if (!c.latitude || !c.longitude || !centre.latitude || !centre.longitude) return { ...c, distance: Infinity };
      const dLat = ((c.latitude - centre.latitude) * Math.PI) / 180;
      const dLon = ((c.longitude - centre.longitude) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((centre.latitude * Math.PI) / 180) * Math.cos((c.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      const distance = 3959 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { ...c, distance };
    })
    .sort((a: any, b: any) => a.distance - b.distance)
    .slice(0, limit);
}

export default async function MoveMyTestLearnerEditPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const session = await requireMoveMyTestSession("/dashboard/edit");
  const [query] = await Promise.all([searchParams]);

  const listing = await prisma.listing.findFirst({
    where: { accountId: session.accountId, status: { not: "DELETED" } },
    include: {
      currentCentre: true,
      originalCentre: true,
      instructorDetails: true,
    },
    orderBy: { createdAt: "desc" },
  });
  if (!listing) notFound();

  const referenceCentreId = listing.originalCentreId ?? listing.currentCentreId;
  const nearest = await getNearestCentres(referenceCentreId, 10);
  const nearestCentres = nearest.map((n) => n);

  const allCentres = await prisma.testCentre.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, region: true, postcode: true },
  });

  const selectedDesiredCentres = desiredCentreIds(listing.desiredCentreIds);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Your MoveMyTest record</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Edit my MoveMyTest record</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Update your current test details, preferred swap window and acceptable centres. Your booking reference stays protected and cannot be edited here.
          </p>
        </div>
        <Link href="/dashboard" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[var(--brand)] hover:text-[var(--brand-strong)]">Back to dashboard</Link>
      </div>

      <StatusMessage status={query?.status} />

      <form action={updateMoveMyTestLearnerRecordAction} className="space-y-6 rounded-3xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6">
        <input type="hidden" name="listingId" value={listing.id} />

        <section className="space-y-4 rounded-2xl border border-slate-300 bg-slate-50 p-5">
          <h3 className="text-xl font-semibold text-slate-950">Current booked test</h3>
          <label className="space-y-2 text-sm font-medium text-slate-800">
            Current test centre
            <CentrePicker name="currentCentreId" centres={allCentres} defaultValue={listing.currentCentreId} required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-800">
            Original// first-booked centre, if known
            <CentrePicker name="originalCentreId" centres={allCentres} defaultValue={listing.originalCentreId ?? ""} includeEmptyOption />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-800">
              Current test date
              <input name="currentDate" type="date" required defaultValue={formatInputDate(listing.currentDateTime)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-800">
              Current test time
              <input name="currentTime" type="time" required defaultValue={formatInputTime(listing.currentDateTime)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" />
            </label>
          </div>
          <label className="space-y-2 text-sm font-medium text-slate-800">
            Test type/category
            <select name="testType" defaultValue={listing.testType} required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
              {Object.entries(TEST_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-300 bg-white p-5">
          <h3 className="text-xl font-semibold text-slate-950">What you would consider</h3>
        <AutoDirectionEditField
          desiredFromDefault={formatInputDate(listing.desiredDateFrom)}
          desiredToDefault={formatInputDate(listing.desiredDateTo)}
          directionDefault={listing.desiredDirection}
        />
          <label className="space-y-2 text-sm font-medium text-slate-800">
            Time preference
            <select name="desiredTimePreference" defaultValue={listing.desiredTimePreference} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
              {Object.entries(TIME_PREFERENCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-800">
            Acceptable swap centres
            {referenceCentreId ? (
              <>
                <select name="desiredCentreIds" multiple size={11} required defaultValue={selectedDesiredCentres} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm">
                  {/* Include the current/original centre itself — DVSA rule allows same-centre swaps */}
                  {listing.currentCentre && (
                    <option value={listing.currentCentre.id}>{listing.currentCentre.name} · {listing.currentCentre.region}{listing.currentCentre.postcode ? ` · ${listing.currentCentre.postcode}` : ""} (same centre)</option>
                  )}
                  {nearestCentres.map((centre) => <option key={centre.id} value={centre.id}>{centre.name} · {centre.region}{centre.postcode ? ` · ${centre.postcode}` : ""}</option>)}
                </select>
                <span className="block text-xs font-normal text-slate-500">Your current test centre is included as the first option. Hold Command/Ctrl to choose more than one.</span>
              </>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                No nearby test centres are available for your current/original centre yet. You can still save the rest of your record; acceptable centres will be added when centre neighbour data is updated.
                <input type="hidden" name="desiredCentreIds" value="" />
              </div>
            )}
          </label>
        </section>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          This does not change or reveal your DVSA booking reference. Keep your DVSA booking reference private until both learners have accepted a match and are ready for the official DVSA phone process.
        </div>

        <button className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]">Save my MoveMyTest record</button>
      </form>
    </div>
  );
}
