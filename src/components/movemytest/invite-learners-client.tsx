"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { inviteLearnerToMoveMyTestAction } from "@/features/movemytest/instructor-actions";

const initialInviteState = { status: "idle" as const, message: "" };

type Invite = {
  id: string;
  learnerName: string | null;
  email: string;
  mobileNumber: string | null;
  status: string;
  createdAt: string;
  movemytestAccount: { email: string } | null;
};

export function InviteLearnersClient({
  assignedInstructor,
  initialInvites,
}: {
  assignedInstructor: { firstName: string; lastName: string; adiNumber: string; email: string };
  initialInvites: Invite[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(inviteLearnerToMoveMyTestAction, initialInviteState);
  const [invites, setInvites] = useState(initialInvites);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

// Auto-refresh invites after successful send
  useEffect(() => {
    if (state.status === "success") {
      setLastSuccess(state.message ?? null);
// Refresh the page after a brief delay to update the invites list
      const timer = setTimeout(() => router.refresh(), 1200);
      return () => clearTimeout(timer);
    }
  }, [state.status, state.message, router]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--brand)]">Invite Learners</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Invite your learners to MoveMyTest</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
          Send an invite link to your learners. When they register, your ADI number will be pre-filled so their listing is immediately visible to you.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Your details will be shared with the learner:</p>
          <p className="mt-1">{assignedInstructor.firstName} {assignedInstructor.lastName} · ADI: {assignedInstructor.adiNumber} · {assignedInstructor.email}</p>
          <p className="mt-2 text-xs text-blue-700">This appears in the invite email so learners know it&apos;s from you. After they register, their listing will be automatically linked to your ADI number.</p>
        </div>

        <form action={action} className="space-y-4">
          {lastSuccess && !pending ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950">
              ✅ Invite sent! The learner will receive an email shortly. This page will refresh automatically.
            </div>
          ) : state.status === "error" ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-950">
              {state.message}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-800">
              Learner email
              <input name="email" type="email" required className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" placeholder="learner@email.com" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-800">
              Learner name (optional)
              <input name="learnerName" type="text" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" placeholder="Jane Smith" />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-800 md:col-span-2">
              Mobile number (optional)
              <input name="mobileNumber" type="tel" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm" placeholder="07..." />
            </label>
          </div>

          <button
            disabled={pending}
            className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-strong)] disabled:opacity-60"
          >
            {pending ? "Sending invite..." : "Send invite link"}
          </button>

          <p className="text-xs text-slate-500">
            The learner will receive an email with a registration link. When they create an account, your ADI number will be pre-filled so their future listings are visible to you.
          </p>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Sent invites</h2>
        {invites.length ? (
          <div className="mt-4 divide-y divide-slate-100">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950 truncate">
                    {invite.learnerName ?? invite.email}
                  </p>
                  <p className="text-xs text-slate-500">
                    {invite.email}{invite.mobileNumber ? ` · ${invite.mobileNumber}` : ""} · {new Date(invite.createdAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  invite.status === "CLAIMED" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" :
                  invite.status === "SENT" ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" :
                  invite.status === "EMAIL_FAILED" ? "bg-red-50 text-red-700 ring-1 ring-red-200" :
                  "bg-slate-50 text-slate-600 ring-1 ring-slate-200"
                }`}>
                  {invite.status === "CLAIMED" ? "Registered" :
                   invite.status === "SENT" ? "Sent" :
                   invite.status === "EMAIL_FAILED" ? "Not sent" :
                   "Pending"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
            You haven&apos;t invited any learners yet. Use the form above to send your first invite.
          </p>
        )}
      </section>
    </div>
  );
}
