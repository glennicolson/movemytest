/**
 * MoveMyTest Notification Settings page.
 *
 * Phase 8.4 (2026-06-07). Mirrors the DTC-side /portal/notifications
 * page (src/app/(portal)/portal/notifications/page.tsx) for parity.
 * Toggles: match alerts, marketing emails. Re-consent button for users
 * who previously opted out via STOP.
 *
 * Uses the same Lucide icons and styling tokens as the rest of the
 * MMT dashboard so it feels native.
 */

import type { Metadata } from "next";
import { AlertTriangle, BellRing, Mail, MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import {
  getMmtPreferences,
  updateMmtPreferencesAction,
  reConsentAction,
  type MoveMyTestPreferences,
} from "@/features/movemytest/notification-preferences";

export const metadata: Metadata = {
  title: "Notification Settings — MoveMyTest",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // requireMoveMyTestSession both gates the page (redirects to /login if
  // no session) and returns the session for our use; we currently only
  // need the gating effect, so discard the return value.
  await requireMoveMyTestSession("/dashboard/settings");
  const prefs = await getMmtPreferences();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notification settings"
        description="Control how MoveMyTest contacts you about matches and account updates."
      />

      {/* Contact details — read-only display */}
      <Card>
        <CardTitle>Your contact details</CardTitle>
        <CardDescription>
          To change your email or mobile number, contact support@movemytest.co.uk.
        </CardDescription>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Mail className="mt-0.5 h-5 w-5 text-[var(--brand)]" />
            <div>
              <p className="text-sm font-semibold text-slate-950">Email</p>
              <p className="text-sm text-slate-600">{prefs.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Phone className="mt-0.5 h-5 w-5 text-[var(--brand)]" />
            <div>
              <p className="text-sm font-semibold text-slate-950">Mobile number</p>
              <p className="text-sm text-slate-600">{prefs.mobileNumber || "Not set"}</p>
              {prefs.smsOptOutAt ? (
                <p className="mt-1 text-xs font-semibold text-red-700">
                  SMS disabled — opted out {formatRelativeDate(prefs.smsOptOutAt)}
                </p>
              ) : prefs.mobileNumber ? (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  ✅ SMS notifications enabled
                </p>
              ) : (
                <p className="mt-1 text-xs font-semibold text-amber-700">
                  ⚠️ Add a mobile number to receive SMS alerts
                </p>
              )}
            </div>
          </div>
        </div>

        {prefs.smsOptOutAt && (
          <form action={reConsentAction} className="mt-5">
            <button
              type="submit"
              className="rounded-full bg-[var(--brand)] px-5 py-2 text-sm font-semibold !text-white transition hover:!text-white"
            >
              Re-enable SMS notifications
            </button>
            <p className="mt-2 text-xs text-slate-500">
              Clicking this re-subscribes you to SMS match alerts. You can still
              opt out at any time by texting STOP.
            </p>
          </form>
        )}
      </Card>

      {/* Match Notifications */}
      <Card>
        <div className="flex items-center gap-3">
          <BellRing className="h-5 w-5 text-[var(--brand)]" />
          <CardTitle>Match notifications</CardTitle>
        </div>
        <CardDescription>
          When a learner-to-learner match is found, we&apos;ll let you know within seconds.
          You can also reply YES or NO by text to accept or decline.
        </CardDescription>

        <form action={updateMmtPreferencesAction} className="mt-5 space-y-4">
          <PreferenceRow
            icon={MessageSquare}
            label="SMS match notifications"
            description="Text message for every match found"
            name="matchSms"
            defaultChecked={prefs.matchSms && !prefs.smsOptOutAt}
          />
          <PreferenceRow
            icon={Mail}
            label="Email match notifications"
            description="Email backup with full match details"
            name="matchEmail"
            defaultChecked={prefs.matchEmail}
          />

          <div className="pt-2">
            <button className="rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold !text-white transition hover:!text-white">
              Save preferences
            </button>
          </div>
        </form>
      </Card>

      {/* Marketing */}
      <Card>
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-[var(--brand)]" />
          <CardTitle>Marketing updates</CardTitle>
        </div>
        <CardDescription>
          Occasional emails about pass-rate tips and MoveMyTest features. We don&apos;t
          send marketing texts and we never share your details with third parties.
        </CardDescription>

        <form action={updateMmtPreferencesAction} className="mt-5 space-y-4">
          <PreferenceRow
            icon={Mail}
            label="Marketing emails"
            description="Pass-rate tips and MoveMyTest feature updates — no more than monthly"
            name="marketingEmail"
            defaultChecked={prefs.marketingEmail}
          />

          <div className="pt-2">
            <button className="rounded-full bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold !text-white transition hover:!text-white">
              Save preferences
            </button>
          </div>
        </form>
      </Card>

      {/* STOP explanation */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">You can stop SMS at any time</p>
            <p className="mt-1 text-sm text-amber-800">
              Text <strong>STOP</strong> to any of our messages and we&apos;ll unsubscribe you
              immediately. You can re-enable SMS notifications at any time on this page.
            </p>
            <p className="mt-2 text-sm text-amber-700">
              If you opt out of SMS you&apos;ll still receive match emails unless you also
              unsubscribe from emails separately.
            </p>
          </div>
        </div>
      </div>

      {/* GDPR / privacy reassurance */}
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Your data, your control</p>
          <p className="mt-1 text-sm text-slate-600">
            We hold your notification preferences and a full log of every change for
            GDPR accountability. We never share your details with third parties. To
            request a copy of your data or delete your account, email
            <a className="ml-1 underline" href="mailto:support@movemytest.co.uk">support@movemytest.co.uk</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function PreferenceRow({
  icon: Icon,
  label,
  description,
  name,
  defaultChecked,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  name: keyof MoveMyTestPreferences;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">{label}</p>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              name={name}
              defaultChecked={defaultChecked}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-[var(--brand)] peer-focus:ring-2 peer-focus:ring-[var(--brand)]/30"></div>
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays < 14 ? "" : "s"} ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
