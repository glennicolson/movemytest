import Link from "next/link";
import { getLearnerMoveMyTestDashboard } from "@/features/movemytest/queries";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { deleteMoveMyTestListingAction, pauseMoveMyTestListingAction } from "@/features/movemytest/actions";
import { DIRECTION_LABELS, TIME_PREFERENCE_LABELS } from "@/features/movemytest/constants";
import { formatMatchExpiryRemaining } from "@/features/movemytest/business-days";
import { Faq } from "@/components/movemytest/dashboard-helpers";
import { AutoDismissBanner } from "@/components/movemytest/auto-dismiss-banner";
import { DtcNetworkBadge } from "@/components/movemytest/dtc-network-badge";

export default async function MoveMyTestDashboardOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ updated?: string; deleted?: string }>;
}) {
  const session = await requireMoveMyTestSession("/dashboard");
  const { listing, desiredCentres, matches, history } = await getLearnerMoveMyTestDashboard(session.accountId);
  const formatDateTime = (value: Date) =>
    value.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
  const formatDate = (value: Date) =>
    value.toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" });

  const params = await searchParams;
  const showUpdated = params?.updated === "true";
  const showDeleted = params?.deleted === "true";

  return (
    <div className="space-y-8">
      {/* Save confirmation */}
      {showUpdated && (
        <AutoDismissBanner
          kind="updated"
          message="Your listing has been updated"
          detail="Your MoveMyTest record changes have been saved. MoveMyTest will use the new details when checking for compatible matches."
        />
      )}

      {showDeleted && (
        <AutoDismissBanner
          kind="deleted"
          message="Your listing has been deleted"
          detail="Your test swap listing has been removed. Any active matches have also been cleared."
          showCreateButton
        />
      )}

      {/* Overview */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Account overview</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Welcome back. Here&apos;s a summary of your MoveMyTest account and any active or previous swap requests.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Account status</p>
            <p className="mt-2 font-semibold text-emerald-700">Active</p>
            <p className="mt-1 text-sm text-slate-600">{session.email}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Listing status</p>
            {listing ? (
              <p className="mt-2 font-semibold text-slate-950">{listing.status.toLowerCase().replaceAll("_", " ")}</p>
            ) : (
              <p className="mt-2 font-semibold text-amber-700">No listing yet</p>
            )}
            <p className="mt-1 text-sm text-slate-600">
              {listing ? `${listing.currentCentre.name}` : "Create one to start matching"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Swap history</p>
            <p className="mt-2 font-semibold text-slate-950">{history.length}</p>
            <p className="mt-1 text-sm text-slate-600">
              {history.length ? "Previous swap requests" : "No swaps completed yet"}
            </p>
          </div>
        </div>

        {!listing ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h3 className="font-semibold text-emerald-950">Ready to find a swap?</h3>
            <p className="mt-2 text-sm leading-6 text-emerald-900">
              Create your free listing with your current test centre, date and time. We&apos;ll match you with compatible
              learners who meet the same DVSA swap rules.
            </p>
            <Link
              href="/start"
              className="mt-4 inline-flex rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white"
            >
              Create your free test swap listing
            </Link>
          </div>
        ) : listing.status === "COMPLETED" ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-semibold text-blue-950">Swap completed</h3>
              <p className="mt-2 text-sm leading-6 text-blue-900">
                Your test swap for {listing.currentCentre.name} on{" "}
                {formatDateTime(listing.currentDateTime)} has been completed. If you need to swap again, add a new
                listing below.
              </p>
            </div>
            <Link
              href="/start"
              className="inline-flex rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold !text-white shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white"
            >
              Add a new test swap listing
            </Link>
            <p className="text-xs text-slate-500">
              You can add a new listing when you have a new DVSA test booking. Previous listings stay in your swap
              history.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Your current test</p>
                <p className="mt-2 font-semibold text-slate-950">{listing.currentCentre.name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {listing.currentCentre.postcode ?? "Postcode unavailable"}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {formatDateTime(listing.currentDateTime)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Desired swap</p>
                <p className="mt-2 font-semibold text-emerald-950">
                  {DIRECTION_LABELS[listing.desiredDirection]}
                </p>
                <p className="mt-1 text-sm text-emerald-900">
                  {formatDate(listing.desiredDateFrom)} to {formatDate(listing.desiredDateTo)}
                </p>
                <p className="mt-1 text-sm text-emerald-900">
                  Preferred time: {TIME_PREFERENCE_LABELS[listing.desiredTimePreference]}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Desired swap locations
              </p>
              {desiredCentres.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {desiredCentres.map((centre) => (
                    <span
                      key={centre.id}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {centre.name}
                      {centre.postcode ? ` · ${centre.postcode}` : ""}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No desired swap locations were saved.</p>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/edit"
                className="rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold !text-white shadow-sm transition hover:bg-[var(--brand-strong)] hover:!text-white"
              >
                Edit my MoveMyTest record
              </Link>
              <form action={pauseMoveMyTestListingAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold">
                  Pause listing
                </button>
              </form>
              <form action={deleteMoveMyTestListingAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <button className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">
                  Delete listing
                </button>
              </form>
            </div>
            {/* Active matches */}
            {matches.length > 0 ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="font-semibold text-amber-950">
                  {(() => {
                    const activeCount = matches.filter(m => !["DECLINED", "EXPIRED", "REPORTED", "COMPLETED"].includes(m.match.status)).length;
                    return `${activeCount} active match${activeCount !== 1 ? "es" : ""}`;
                  })()}
                </h3>
                <div className="mt-3 space-y-3">
                  {matches.map(({ match, otherListing, otherCentre }) => {
                    const isDeclined = match.status === "DECLINED";
                    const isExpired = match.status === "EXPIRED";
                    const isDtc = otherListing?.source === "DTC";
                    return (
                      <div key={match.id} className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between ${isDeclined || isExpired ? "opacity-50" : ""}`}>
                        <Link
                          href={`/matches/${match.id}`}
                          className={`text-sm font-semibold hover:underline ${isDeclined || isExpired ? "text-slate-500" : "text-[var(--brand)]"}`}
                        >
                          {otherCentre.name} · Match quality {match.score}/100
                        </Link>
                        <div className="flex items-center gap-2">
                          {isDtc && <DtcNetworkBadge />}
                          {match.status === "PROPOSED" && match.expiresAt ? (
                            <span className="inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
                              Expires: {formatMatchExpiryRemaining(match.expiresAt)}
                            </span>
                          ) : isDeclined ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                              Declined
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              Expired
                            </span>
                          ) : (
                            <span className="text-xs text-amber-800 capitalize">
                              {match.status.toLowerCase().replaceAll("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-600">No active matches yet. We&apos;ll email you when we find one.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* FAQ */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">FAQ</h2>
        <div className="mt-5 space-y-3">
          <Faq
            question="Does MoveMyTest complete the swap for me?"
            answer="No. MoveMyTest helps you find a possible match. The official swap must be completed by phone with DVSA."
          />
          <Faq
            question="When should I share my booking reference?"
            answer="Only after both learners have agreed to a match and are ready to call DVSA. Do not share licence numbers, card details, addresses or GOV.UK login details."
          />
          <Faq
            question="What if my instructor is not free?"
            answer="Do not accept the swap until you have checked instructor availability for the new date, time and centre."
          />
          <Faq
            question="Why can't I see call instructions yet?"
            answer="Call instructions appear once both parties agree to a match. Until then, keep checking My Match and Queue Status."
          />
        </div>
      </section>
    </div>
  );
}
