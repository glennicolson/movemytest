"use client";

import { useActionState } from "react";
import { completeMoveMyTestAccountSetupAction, type MoveMyTestAccountSetupState } from "@/features/movemytest/account-setup-actions";

const initialState: MoveMyTestAccountSetupState = { status: "idle" };

export function MoveMyTestAccountSetupForm({ from, defaultMobileNumber }: { from?: string; defaultMobileNumber?: string | null }) {
  const [state, action, pending] = useActionState(completeMoveMyTestAccountSetupAction, initialState);

  return (
    <form action={action} className="mt-6 space-y-5">
      <input type="hidden" name="from" value={from ?? "/dashboard/what-to-expect"} />
      {state.status === "error" ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.message}</div> : null}
      <div>
        <label htmlFor="mobileNumber" className="text-sm font-semibold text-slate-800">Mobile number</label>
        <input id="mobileNumber" name="mobileNumber" type="tel" autoComplete="tel" required defaultValue={defaultMobileNumber ?? ""} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--brand)_20%,white)]" placeholder="e.g. 07123 456789" />
        <p className="mt-2 text-xs leading-5 text-slate-500">We use this to send SMS or WhatsApp alerts when a suitable swap becomes available.</p>
      </div>
      <label className="flex gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        <input name="mobileContactConsent" type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--brand)]" />
        <span>I agree that MoveMyTest can contact me by SMS or WhatsApp about my MoveMyTest listing, matches, and safety/next-step reminders.</span>
      </label>
      <button type="submit" disabled={pending} className="inline-flex w-full justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Saving..." : "Continue to create my listing"}
      </button>
    </form>
  );
}
