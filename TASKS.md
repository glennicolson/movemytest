# MoveMyTest Tasks

## TODAY (2026-06-08) — MMT

Multiple fixes landed in this session. Verified on live by Glen where applicable.

### Status-conditional banner fix — verified on live
- [x] MMT `/dashboard/what-to-expect` no longer shows hardcoded "Your listing is live" for any status. Commit `a4f1c81` of MMT repo. Banner now shows different copy per `listing.status`:
  - ACTIVE → "Your listing is live" (green)
  - PAUSED → "Your listing is paused" (amber)
  - MATCHED → "You have an active match" (blue)
  - COMPLETED → "Your last swap is complete" (slate)
  - EXPIRED → "Your listing has expired" (amber)
  - DELETED → no banner
  Glen reloaded live at 16:16 BST and confirmed.

### Live fixes (DB-side, ran via phpMyAdmin on `u385361430_movedata`)
- [x] 08:30 BST — Added 3 `LearnerAccount` columns: `smsOptOutAt`, `smsOptOutReason`, `lastOptOutAt`. Created `_prisma_migrations` table.
- [x] 14:43 BST — Added 3 DTC bridge columns: `LearnerAccount.crmUserId`, `InstructorAccount.crmInstructorProfileId`, `LearnerInvite.invitedByUserId`. Added 2 unique indexes.

### Data cleanup (dev DB, `localhost`-guarded script)
- [x] 09:15 BST — Cleaned 478 bad datetime rows across 31 columns on MMT dev DB using `scripts/fix-bad-datetimes.mjs`.

### Code fixes (commits pushed to MMT origin/main)
- [x] `dedb305` — CSP fix (dev + prod, Typekit + Google Analytics), favicon refresh, `site.webmanifest` MMT branding, queue worker `now.toISOString()` → Date object, `.env.example` template, 2 dev utility scripts, .gitignore sensitive-scratch exclusion
- [x] `5a689c7` — Added `@types/qrcode` dev dep for type safety on QRCode API
- [x] `6e099ca` — Removed orphan marketing `site-header-client.tsx` + `site-header.tsx` (missing `framer-motion` dep); kept `nav-data.ts` with inlined `NavItem` type
- [x] `4138f3f` — Removed 8 orphan `ui/*.tsx` files (including `virtual-data-table.tsx`, missing `@tanstack/react-virtual` dep)
- [x] `33a669d` — Removed orphan `ga-service-account.ts` (missing `@google-analytics/data` dep)
- [x] `73cd9c9` — Removed orphan `use-query.ts` (missing `@tanstack/react-query` dep)
- [x] `a4f1c81` — Status-conditional banner fix on `/dashboard/what-to-expect` (MMT equivalent of the DTC one)

### SMS-on-match bug (HIGH, fix needed)
- [x] 17:11 BST — Diagnosed: `actions.ts:98-100` and `:551-552` queue SMS but never drain it
- [x] 17:14 BST — 17 of 20 stale SmsQueue rows marked `SKIPPED` via `scripts/skip-stale-sms-queue.mjs`
- [x] 17:20 BST — **FIX COMMITTED + PUSHED** in commit `4ee5e61` on MMT main (verified via `git ls-remote`). tsc + build clean. Awaiting live deploy.
- [ ] Update the "lazy processing" comment at `sms-queue.ts:5-9` — either remove it or actually wire a hook to drain the queue on dashboard loads
- [ ] Glen to decide on 3 PENDING `SWAP_COMPLETED_CONFIRMATION` rows for already-COMPLETED matches (drain / skip / leave)

### Still pending (Next Up)
- [ ] `/dashboard/edit` status-blind page (same shape of bug, allows editing a COMPLETED listing)
- [ ] Pre-push schema check tool — 4 drift recurrences today would have been caught by this
- [ ] 154 pre-existing TypeScript errors (per MMT_SWEEP_2026-06-08.md, some are real bugs)
- [ ] Two scrypt hash formats unification (`scrypt$<salt>$<hash>` vs `<salt>.<hash>`)

---
---

## In Progress
- [x] DTC → MMT sync tested and working (47 listings synced)
- [x] Webhook API specification (WEBHOOK_SPEC.md)
- [x] Webhook library (HMAC signing, verification, retries)
- [x] MMT → DTC webhook sender (match.proposed, accepted, cancelled, completed)
- [x] MMT webhook receiver endpoint (/api/webhooks/dtc) ✅ Working 2026-05-31
- [x] DTC webhook receiver endpoint (/api/webhooks/mmt) ✅ Working 2026-05-31
- [x] Update MMT matching engine to send webhooks (triggers on DTC listing match)
- [x] Add dtcMatchId field to MMT Match model (schema updated, migration SQL created)
- [x] Build passes with webhook routes included
- [x] Fix webhook URL to thedtc.co.uk ✅ Fixed 2026-05-31
- [x] Fix DTC webhook receiver to match DTC schema ✅ Fixed 2026-05-31
- [x] DTC database migration completed ✅ Fixed 2026-05-31 09:10
  - Added missing `theirTestType` column
  - DTC dashboard now working
- [ ] Test end-to-end webhook flow (create match, verify webhook fires)
- [ ] Verify DTC Network badge displays correctly on matches
- [ ] Monitor webhook logs for any errors

## Done
- [x] Phase 1: Shadow sync table (source, dtcListingId columns)
- [x] Phase 2: Shared pool matching + DTC Network badge
- [x] SEO fixes: schema data, canonicals, OG image, titles
- [x] Production sync script (PHP for Hostinger)
- [x] Database credentials configured for bidirectional access
- [x] Webhook infrastructure (signing, verification, retry logic)
- [x] Webhook routes built and included in production build
- [x] DTC schema updated with cross-platform fields
- [x] DTC database migration applied successfully
- [x] DTC dashboard working (added missing `theirTestType` column)

## Next Steps
1. Test end-to-end webhook flow:
   - Create MMT listing that matches with DTC listing
   - Check server logs for webhook delivery
   - Verify DTC creates shadow match
2. Check MMT server logs: `tail -f /home/u385361430/logs/webhook.log`
3. Check DTC server logs: `tail -f /home/u385361430/logs/webhook.log`
4. Verify webhook delivery in browser console or server logs

## Webhook Implementation Summary

### Status: ✅ BOTH APIs WORKING (2026-05-31 08:51 GMT+1)
- DTC Dashboard: ✅ Working (fixed missing column)
- DTC Webhook Receiver: ✅ Working
- MMT Webhook Receiver: ✅ Working

### Endpoints
- **MMT sends to DTC**: `POST https://www.thedtc.co.uk/api/webhooks/mmt`
- **DTC sends to MMT**: `POST https://movemytest.co.uk/api/webhooks/dtc`

### Environment Variables
**MoveMyTest:**
```env
DTC_WEBHOOK_URL=https://www.thedtc.co.uk/api/webhooks/mmt
DTC_WEBHOOK_SECRET=***
```

**DTC:**
```env
MMT_WEBHOOK_URL=https://movemytest.co.uk/api/webhooks/dtc
MMT_WEBHOOK_SECRET=***
```

### How It Works
1. MMT user creates listing → matching engine runs
2. If match found with DTC listing (`source='DTC'`)
3. MMT sends `match.proposed` webhook to DTC
4. DTC creates shadow match record in its database
5. DTC user sees match in their DTC dashboard
6. DTC user accepts → DTC sends `match.accepted` webhook to MMT
7. MMT updates match status

### Console Errors (Non-Critical)
- `ERR_CERT_AUTHORITY_INVALID` on MMT dashboard pages — SSL/network security issue
- These are NOT webhook errors
- Webhooks fire server-to-server, not through browser
- Check server logs for actual webhook delivery status
