"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RecordPaymentPopup({
  learners,
}: {
  learners: Array<{ id: string; name: string; email: string }>;
}) {
  const router = useRouter();
  const [learnerId, setLearnerId] = useState("");
  const [query, setQuery] = useState("");

  const filtered = learners.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.email.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 15);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search learner by name or email..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />

      <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
        {filtered.length > 0 ? filtered.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLearnerId(l.id)}
            className={`w-full text-left px-3 py-2.5 text-sm transition ${
              learnerId === l.id
                ? "bg-emerald-50 text-emerald-800 font-medium"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <div>{l.name}</div>
            <div className="text-xs text-slate-500">{l.email}</div>
          </button>
        )) : (
          <div className="px-3 py-6 text-center text-sm text-slate-400">
            {query ? "No learners found" : "Start typing to search"}
          </div>
        )}
      </div>

      <button
        disabled={!learnerId}
        onClick={() => router.push(`/learners/${learnerId}?tab=learner-payments`)}
        className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        Go to payment page →
      </button>
      <p className="text-xs text-slate-500 text-center">Select a learner to open their invoices & payments</p>
    </div>
  );
}
