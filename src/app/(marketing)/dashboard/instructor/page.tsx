import Link from "next/link";
import { getLearnerMoveMyTestDashboard } from "@/features/movemytest/queries";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { AvailabilityNotice, InfoTile } from "@/components/movemytest/dashboard-helpers";
import { RemoveInstructorButton } from "@/components/movemytest/remove-instructor-button";

export default async function InstructorPage() {
  const session = await requireMoveMyTestSession("/dashboard/instructor");
  const { listing } = await getLearnerMoveMyTestDashboard(session.accountId);
  const instructorDecisions = listing?.instructorDetails?.availabilityDecisions ?? [];
  const currentSlotDecision = instructorDecisions.find((d) => d.slotType === "CURRENT_TEST" && !d.matchId);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Instructor</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          View your instructor details and their availability for your current test and any proposed swaps.
        </p>

        {!listing ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Create a listing first to link an instructor.
          </div>
        ) : listing.instructorDetails ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoTile
                label="Instructor"
                value={`${listing.instructorDetails.firstName ?? "Unknown"} ${listing.instructorDetails.lastName ?? ""}`}
              />
              <InfoTile label="ADI number" value={listing.instructorDetails.adiNumber ?? "Not provided"} />
              <InfoTile label="Mobile" value={listing.instructorDetails.mobileNumber ?? "Not provided"} />
              <InfoTile label="Email" value={listing.instructorDetails.email ?? "Not provided"} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={"/dashboard/instructor/edit" as any}
                className="instructor-edit-button rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition"
              >
                Edit instructor details
              </Link>
              <RemoveInstructorButton listingId={listing.id} />
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Instructor availability for your current test</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                If your instructor uses the independent MoveMyTest instructor dashboard, their latest availability
                decision appears here.
              </p>
              <AvailabilityNotice decision={currentSlotDecision} />
            </div>
          </>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              No instructor details are linked to this listing yet.
            </p>
            <Link
              href={"/dashboard/instructor/edit" as any}
              className="inline-block rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)]"
            >
              Add instructor
            </Link>
          </div>
        )}

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Before accepting a swap, check your instructor is still available for the new date, time and test centre.
        </p>
      </section>
    </div>
  );
}
