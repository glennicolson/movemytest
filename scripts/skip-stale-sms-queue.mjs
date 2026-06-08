// Mark stale SmsQueue rows as SKIPPED with an audit reason.
// Safe: does not actually send any SMS — just updates rows in the DB.
//
// Run:  node scripts/skip-stale-sms-queue.mjs --apply
// Dry:  node scripts/skip-stale-sms-queue.mjs
//
// Reason: 2026-06-08 17:11 BST — Glen reported SMS not sent on MMT match
// creation. Root cause: src/features/movemytest/movemytest/actions.ts:98-100
// and :551-552 queue SMS but never drain it. 20 rows have been PENDING for
// 24+ hours. Matches from that window are now COMPLETED/EXPIRED, so the
// worker would skip them on next run (status filter at sms-queue.ts:140-180).
// This script encodes the same outcome now — no real SMS will be sent.

import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const AUDIT_REASON =
  "Audit 2026-06-08 17:11 BST: MMT SMS worker was not wired to match creation. " +
  "Match is no longer in a state where this message kind is applicable. " +
  "Marked SKIPPED by scripts/skip-stale-sms-queue.mjs so the worker is not " +
  "expected to send a stale message. See memory/2026-06-08.md for full bug report.";

async function main() {
  const pending = await p.smsQueue.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });
  console.log(`Found ${pending.length} PENDING rows.`);

  // For each, look up the match status — that's the only "would-be-skipped?" signal.
  const matchIds = [...new Set(pending.map((r) => r.matchId))];
  const matches = await p.match.findMany({
    where: { id: { in: matchIds } },
    select: { id: true, status: true },
  });
  const matchStatus = new Map(matches.map((m) => [m.id, m.status]));

  // Group rows by their would-be decision (mirrors sms-queue.ts:140-180)
  const wouldSend = [];
  const wouldSkip = [];
  for (const r of pending) {
    const ms = matchStatus.get(r.matchId) ?? "MISSING";
    let skip = false;
    if (
      ["SWAP_INCOMPLETE_REMINDER", "SWAP_COMPLETED_NOT_CLOSED",
       "MATCH_ACCEPTANCE_REMINDER", "MATCH_FINAL_WARNING"].includes(r.kind) &&
      ["COMPLETED", "EXPIRED"].includes(ms)
    ) skip = true;
    if (r.kind === "MATCH_FOUND" && ms !== "PROPOSED") skip = true;
    if (r.kind === "MATCH_DECLINED" && ms !== "DECLINED") skip = true;
    (skip ? wouldSkip : wouldSend).push({ row: r, matchStatus: ms });
  }

  console.log(`\n=== Would-SKIP (worker would have skipped these on next run) ===`);
  for (const s of wouldSkip) {
    console.log(`  ${s.row.id.slice(0, 40)} | kind=${s.row.kind} | matchStatus=${s.matchStatus} | to=${s.row.recipient}`);
  }
  console.log(`\n=== Would-SEND (worker WOULD have sent these if it had run) ===`);
  for (const s of wouldSend) {
    console.log(`  ${s.row.id.slice(0, 40)} | kind=${s.row.kind} | matchStatus=${s.matchStatus} | to=${s.row.recipient}`);
  }
  console.log(`\nTotal would-skip: ${wouldSkip.length}, would-send: ${wouldSend.length}`);

  if (process.argv[2] === "--apply") {
    console.log("\n--apply flag set. Marking would-skip rows as SKIPPED...");
    for (const s of wouldSkip) {
      await p.smsQueue.update({
        where: { id: s.row.id },
        data: {
          status: "SKIPPED",
          error: AUDIT_REASON,
          updatedAt: new Date(),
        },
      });
    }
    console.log(`Marked ${wouldSkip.length} rows as SKIPPED.`);
    if (wouldSend.length > 0) {
      console.log(`\nNOTICE: ${wouldSend.length} rows would have been SENT if the worker had run.`);
      console.log("These are LEFT ALONE so you can decide what to do with them:");
      for (const s of wouldSend) {
        console.log(`  ${s.row.id.slice(0, 40)} | kind=${s.row.kind} | matchStatus=${s.matchStatus} | to=${s.row.recipient}`);
      }
    }
  } else {
    console.log("\n(Dry run only. Re-run with --apply to mark these as SKIPPED.)");
    console.log("Rows in 'would-send' will be LEFT ALONE so you can decide what to do with them.");
  }

  await p.$disconnect();
}

main();
