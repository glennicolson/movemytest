import Link from "next/link";
import { getLearnerMoveMyTestDashboard } from "@/features/movemytest/queries";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { InfoTile } from "@/components/movemytest/dashboard-helpers";

export default async function AccountPage() {
  const session = await requireMoveMyTestSession("/dashboard/account");
  const { listing } = await getLearnerMoveMyTestDashboard(session.accountId);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Account details</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Manage your contact details and notification preferences for MoveMyTest updates.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <InfoTile label="Email" value={listing?.account?.email ?? session.email} />
          <InfoTile label="Mobile" value={listing?.account?.mobileNumber ?? "Not set"} />
          <InfoTile
            label="SMS/WhatsApp alerts"
            value={listing?.account?.accountSetupCompletedAt ? "Enabled" : "Not completed"}
          />
          <InfoTile
            label="Marketing updates"
            value={listing?.account?.marketingConsentAt ? "Enabled" : "Off"}
          />
        </div>
        <Link
          href="/dashboard/settings"
          className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Manage notification preferences
        </Link>
      </section>
    </div>
  );
}
