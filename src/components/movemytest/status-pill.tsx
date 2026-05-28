export function StatusPill({ status }: { status: string }) {
  const tone = (() => {
    if (["ACTIVE", "PROPOSED", "LEARNER_A_ACCEPTED", "LEARNER_B_ACCEPTED", "BOTH_ACCEPTED", "AVAILABLE", "CLAIMED", "SENT"].includes(status)) return "border-emerald-200 bg-emerald-50 text-emerald-800";
    if (["MATCHED", "BOOKING_REFERENCE_CONSENT_REQUESTED", "BOOKING_REFERENCE_SHARED", "PENDING"].includes(status)) return "border-blue-200 bg-blue-50 text-blue-800";
    if (["PAUSED", "NEEDS_DISCUSSION", "OPEN", "AWAITING_LEARNER"].includes(status)) return "border-amber-200 bg-amber-50 text-amber-800";
    if (["COMPLETED", "RESOLVED"].includes(status)) return "border-slate-200 bg-slate-100 text-slate-800";
    return "border-red-200 bg-red-50 text-red-800";
  })();

  const label = status.toLowerCase().replaceAll("_", " ");

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}>{label}</span>;
}
