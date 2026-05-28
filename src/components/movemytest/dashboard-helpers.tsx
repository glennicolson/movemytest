import Link from "next/link";

export function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function availabilityTone(status?: string) {
  if (status === "AVAILABLE") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "UNAVAILABLE") return "border-red-200 bg-red-50 text-red-800";
  if (status === "NEEDS_DISCUSSION") return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-slate-200 bg-white text-slate-600";
}

export function AvailabilityNotice({
  decision,
  compact = false,
}: {
  decision?: { status: string; note: string | null; decidedAt: Date };
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${compact ? "mt-3" : "mt-3"} ${availabilityTone(decision?.status)}`}>
      <p className="font-semibold">
        Instructor availabilityDecisions: {decision ? decision.status.toLowerCase().replaceAll("_", " ") : "not recorded yet"}
      </p>
      {decision?.note ? <p className="mt-1 leading-6">{decision.note}</p> : null}
      {decision?.decidedAt ? (
        <p className="mt-1 text-xs opacity-80">
          Recorded{" "}
          {decision.decidedAt.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "UTC",
          })}
        </p>
      ) : (
        <p className="mt-1 text-xs opacity-80">
          Keep checking with your instructor before accepting or completing a swap.
        </p>
      )}
    </div>
  );
}

export function Faq({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <summary className="cursor-pointer font-semibold text-slate-950">{question}</summary>
      <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
    </details>
  );
}

export function HelpFreeCard() {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
      <h3 className="font-semibold">Help keep MoveMyTest free</h3>
      <p className="mt-1">
        MoveMyTest is free for learners. If it helped you, an optional one-off contribution helps cover emails,
        hosting and support. There is no obligation, and donating never affects your swaps or support.
      </p>
      <Link
        href="/support-us"
        className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200 hover:ring-emerald-400"
      >
        Buy us a coffee
      </Link>
    </div>
  );
}
