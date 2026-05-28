"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/forms/password-input";
import { registerMoveMyTestLearnerAction, type MoveMyTestRegisterState } from "@/features/movemytest/register-actions";

const initialState: MoveMyTestRegisterState = { status: "idle" };

export function MoveMyTestRegisterForm({ from, inviteToken, initialEmail }: { from?: string; inviteToken?: string; initialEmail?: string }) {
  const [state, action, pending] = useActionState(registerMoveMyTestLearnerAction, initialState);

  return (
    <form action={action} className="mt-6 space-y-5">
      <input type="hidden" name="from" value={from ?? "/dashboard/what-to-expect"} />
      <input type="hidden" name="inviteToken" value={inviteToken ?? ""} />
      {state.status === "error" ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.message}</div> : null}
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-slate-800">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={initialEmail ?? ""} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--brand)_20%,white)]" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-semibold text-slate-800">Secure password</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--brand)_20%,white)]" placeholder="Minimum 8 characters" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-800">Confirm password</label>
        <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" minLength={8} required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--brand)_20%,white)]" placeholder="Repeat your password" />
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
        <label className="flex gap-3"><input name="acceptTerms" type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--brand)]" /><span>I agree to the <Link href="/terms" className="font-semibold text-[var(--brand)] underline underline-offset-4">Terms of Service</Link>.</span></label>
        <label className="flex gap-3"><input name="acceptPrivacy" type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--brand)]" /><span>I agree to the <Link href="/privacy" className="font-semibold text-[var(--brand)] underline underline-offset-4">Privacy Policy</Link>.</span></label>
        <label className="flex gap-3"><input name="acknowledgeOfficialProcess" type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--brand)]" /><span>I understand MoveMyTest does not change, cancel or swap my driving test. If I find a match, the official swap is completed by phone with DVSA.</span></label>
        <label className="flex gap-3"><input name="marketingConsent" type="checkbox" className="mt-1 h-4 w-4 accent-[var(--brand)]" /><span>Send me occasional MoveMyTest updates. Optional.</span></label>
      </div>
      <button type="submit" disabled={pending} className="inline-flex w-full justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Creating your account..." : inviteToken ? "Accept invite and create my account" : "Create my MoveMyTest account"}
      </button>
      <p className="text-center text-xs leading-5 text-slate-500">We do not ask for your driving licence number, theory certificate number, home address, payment card details or GOV.UK login details.</p>
      <p className="text-center text-sm text-slate-600">Already have a MoveMyTest account? <Link href="/login" className="font-semibold text-[var(--brand)] underline underline-offset-4">Sign in</Link></p>
    </form>
  );
}
