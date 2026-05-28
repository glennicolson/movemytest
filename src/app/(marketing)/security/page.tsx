import type { Metadata } from "next";
import Link from "next/link";
import { MfaBackupCodesForm } from "@/components/forms/mfa-backup-codes-form";
import { MfaDisableForm } from "@/components/forms/mfa-disable-form";
import { MfaTotpSetupForm } from "@/components/forms/mfa-totp-setup-form";
import { MoveMyTestAccountNav } from "@/components/movemytest/movemytest-account-nav";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { requireMoveMyTestSession } from "@/features/movemytest/session";
import { beginMoveMyTestTotpSetupAction, confirmMoveMyTestTotpSetupAction, disableMoveMyTestTotpAction, regenerateMoveMyTestBackupCodesAction } from "@/features/movemytest/mfa-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MoveMyTest Security",
  robots: { index: false, follow: false },
};

export default async function MoveMyTestSecurityPage() {
  const session = await requireMoveMyTestSession("/security");
  const activeTotpFactor = await prisma.learnerMfaFactor.findFirst({
    where: { accountId: session.accountId, method: "TOTP", status: "ACTIVE" },
    orderBy: { activatedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-950">← Back to MoveMyTest dashboard</Link>
        <MoveMyTestAccountNav active="security" />
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">MoveMyTest security</p>
              <CardTitle>{activeTotpFactor ? "Authenticator app active" : "Add two-step verification"}</CardTitle>
              <CardDescription>
                Protect your standalone MoveMyTest account with a 6-digit authenticator-app code. This is separate from the main DTC learner portal.
              </CardDescription>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activeTotpFactor ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              {activeTotpFactor ? "MFA active" : "MFA not enabled"}
            </span>
          </div>
        </Card>

        <Card>
          <MfaTotpSetupForm
            beginAction={beginMoveMyTestTotpSetupAction}
            confirmAction={confirmMoveMyTestTotpSetupAction}
            initialHasActiveTotp={Boolean(activeTotpFactor)}
            initialFactorLabel={activeTotpFactor?.label ?? null}
          />
        </Card>

        {activeTotpFactor ? <MfaBackupCodesForm action={regenerateMoveMyTestBackupCodesAction} /> : null}
        <MfaDisableForm action={disableMoveMyTestTotpAction} hasActiveTotp={Boolean(activeTotpFactor)} />
      </div>
    </main>
  );
}
