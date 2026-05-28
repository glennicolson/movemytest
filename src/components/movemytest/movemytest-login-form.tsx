"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/forms/password-input";
import { loginMoveMyTestLearnerAction, type MoveMyTestLoginState } from "@/features/movemytest/login-actions";

const initialState: MoveMyTestLoginState = { status: "idle" };

export function MoveMyTestLoginForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState(loginMoveMyTestLearnerAction, initialState);

  return (
    <form action={action} className="mt-6 space-y-5">
      <input type="hidden" name="from" value={from ?? "/dashboard"} />
      {state.status === "error" ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.message}</div> : null}
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-slate-800">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--brand)_20%,white)]" placeholder="you@example.com" />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-semibold text-slate-800">Password</label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--brand)_20%,white)]" placeholder="Your MoveMyTest password" />
      </div>
      <button type="submit" disabled={pending} className="inline-flex w-full justify-center rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Signing in..." : "Sign in to MoveMyTest"}
      </button>
      <p className="text-center text-sm text-slate-600">
        Need an account? <Link href="/register" className="font-semibold text-[var(--brand)] underline underline-offset-4">Create one free</Link>
      </p>
      <p className="text-center text-sm text-slate-600">
        <Link href="/forgot-password" className="font-semibold text-[var(--brand)] underline underline-offset-4">Forgot your password? Reset it here</Link>
      </p>
    </form>
  );
}
