// Read-only DB inspection: MMT SmsQueue state for the bug we're investigating.
// Run: node scripts/inspect-sms-queue.mjs
// Glen: this script just reads the dev DB and prints — does not modify anything.

import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  console.log("=== Last 15 SmsQueue rows ===");
  const recent = await p.smsQueue.findMany({ take: 15, orderBy: { createdAt: "desc" } });
  for (const r of recent) {
    console.log(
      `  ${r.createdAt.toISOString()} | kind=${r.kind} | status=${r.status} | recipient=${r.recipient} | matchId=${r.matchId?.slice(0, 12) || "(null)"} | sched=${r.scheduledFor?.toISOString() || "?"} | sentAt=${r.sentAt?.toISOString() || "(null)"} | fail=${r.failureCode || "(null)"} | attempts=${r.attempts || 0}`,
    );
  }
  console.log("");

  console.log("=== Counts by status ===");
  const byStatus = await p.smsQueue.groupBy({ by: ["status"], _count: { status: true } });
  for (const r of byStatus) console.log(`  ${r.status}: ${r._count.status}`);
  console.log("");

  console.log("=== Last 5 matches ===");
  const matches = await p.match.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      listingA: { select: { accountId: true, currentCentre: { select: { name: true } } } },
      listingB: { select: { accountId: true, currentCentre: { select: { name: true } } } },
    },
  });
  for (const m of matches) {
    console.log(
      `  ${m.createdAt.toISOString()} | status=${m.status} | score=${m.score} | A=${m.listingA?.currentCentre?.name || "?"} acct=${m.listingA?.accountId || "null"} | B=${m.listingB?.currentCentre?.name || "?"} acct=${m.listingB?.accountId || "null"}`,
    );
  }
  console.log("");

  console.log("=== Accounts from the screenshots ===");
  const accounts = await p.learnerAccount.findMany({
    where: { email: { in: ["glennicolson@me.com", "glennicolson@gmail.com"] } },
  });
  for (const a of accounts) {
    console.log(
      `  id=${a.id} email=${a.email} mobile=${a.mobileNumber || "(null)"} consentAt=${a.mobileContactConsentAt?.toISOString() || "(null)"} optOutAt=${a.smsOptOutAt?.toISOString() || "(null)"}`,
    );
  }
  const prefs = await p.notificationPreference.findMany({
    where: { accountId: { in: accounts.map((a) => a.id) } },
  });
  for (const pp of prefs) {
    console.log(`  prefs: accountId=${pp.accountId} role=${pp.userRole} email=${pp.emailEnabled} sms=${pp.smsEnabled} wa=${pp.whatsappEnabled}`);
  }

  await p.$disconnect();
}

main();
