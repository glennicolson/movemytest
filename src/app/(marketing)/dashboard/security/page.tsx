import { MfaBackupCodesForm } from "@/components/forms/mfa-backup-codes-form";
import { MfaDisableForm } from "@/components/forms/mfa-disable-form";
import { MfaTotpSetupForm } from "@/components/forms/mfa-totp-setup-form";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import {
  beginMoveMyTestTotpSetupAction,
  confirmMoveMyTestTotpSetupAction,
  disableMoveMyTestTotpAction,
  regenerateMoveMyTestBackupCodesAction,
} from "@/features/movemytest/mfa-actions";

export default async function DashboardSecurityPage() {
  const session = await requireMoveMyTestSession("/dashboard/security");
  const activeTotpFactor = await prisma.learnerMfaFactor.findFirst({
    where: { accountId: session.accountId, method: "TOTP", status: "ACTIVE" },
    orderBy: { activatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
              MoveMyTest security
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">
              {activeTotpFactor ? "Authenticator app active" : "Add two-step verification"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Two-step verification is <strong>not compulsory</strong> but we <strong>strongly recommend</strong> it.
              It protects your MoveMyTest account and your matches from unauthorised access.
              This is separate from the main DTC learner portal.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              activeTotpFactor ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {activeTotpFactor ? "MFA active" : "MFA not enabled"}
          </span>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <MfaTotpSetupForm
          beginAction={beginMoveMyTestTotpSetupAction}
          confirmAction={confirmMoveMyTestTotpSetupAction}
          initialHasActiveTotp={Boolean(activeTotpFactor)}
          initialFactorLabel={activeTotpFactor?.label ?? null}
        />
      </section>

      {activeTotpFactor ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Backup codes</h3>
          <MfaBackupCodesForm action={regenerateMoveMyTestBackupCodesAction} />
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Disable MFA</h3>
        <MfaDisableForm action={disableMoveMyTestTotpAction} hasActiveTotp={Boolean(activeTotpFactor)} />
      </section>
    </div>
  );
}
