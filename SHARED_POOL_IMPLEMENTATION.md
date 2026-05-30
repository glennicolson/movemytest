# MoveMyTest Shared Pool — Implementation Plan

## Decision: DTC Network Badge + 5-Minute Sync

**Glen confirmed:**
- DTC listings show **"DTC Network" badge** in search results
- Sync runs **every 5 minutes** via cron job

---

## Phase 2: Update Matching for Shared Pool

### Current State
- `prisma.listing.findMany({ where: { status: "ACTIVE" } })` already queries ALL listings
- DTC shadow listings have `source='DTC'` and `accountId=null`
- Matching engine will automatically find DTC listings ✅

### Changes Needed

#### 1. Add `source` to match queries (UI badge)
Update `getLearnerMoveMyTestDashboard` and match-related queries to return `source` field so the UI can show the DTC Network badge.

**Files to update:**
- `src/features/movemytest/queries.ts` — add `source` to listing selects
- `src/features/movemytest/actions.ts` — pass `source` through match data

#### 2. Handle email notifications for DTC listings
When a match involves a DTC listing, we can't send MMT emails. Options:
- **A:** Skip email for DTC side (they get notified via DTC)
- **B:** DTC listing stores `dtcUserEmail` — email them directly from MMT
- **C:** Webhook to DTC to trigger DTC's notification

**Decision:** Option A for now — DTC users get notified via DTC's own system. MMT only emails MMT users.

**Code change:** In `scheduleMatchProposedEmails`, check if listing has `accountId` before sending.

#### 3. DTC Network badge in UI
When displaying a match or listing from DTC:
- Show small "DTC Network" pill/badge
- Different color (subtle grey or DTC brand color)
- Tooltip: "This learner registered via The DTC driving school"

#### 4. Prevent DTC listing editing in MMT
DTC shadow listings should be read-only in MMT:
- `edit` action rejects if `source === 'DTC'`
- `withdraw` action rejects if `source === 'DTC'`
- Dashboard shows "Managed via DTC" instead of edit buttons

#### 5. Sync script updates
Add to `sync-dtc-to-mmt.ts`:
- Set `dtcUserEmail` from DTC user data (for potential future use)
- Better logging for cron output
- Lock file to prevent overlapping runs

---

## Phase 3: Cron Setup

### Hostinger Cron Job
```bash
*/5 * * * * cd /home/u385361430/domains/movemytest.co.uk/nodejs && npx tsx src/scripts/sync-dtc-to-mmt.ts >> /home/u385361430/logs/sync-dtc.log 2>&1
```

### Alternative: GitHub Actions
Schedule GitHub Action every 5 minutes that calls a webhook on MMT server.

---

## Phase 4: Testing Checklist

- [ ] Sync script runs without errors (dry-run)
- [ ] DTC listings appear in MMT search results with badge
- [ ] MMT listings appear in DTC search results (via DTC's own sync)
- [ ] Matching engine finds cross-platform matches
- [ ] Email notifications work correctly (MMT→MMT, DTC→DTC, no cross-email)
- [ ] DTC listings are read-only in MMT dashboard
- [ ] Sync withdraws stale DTC listings correctly
- [ ] Performance: 1000+ listings sync in < 30 seconds

---

## Files to Create/Modify

### New files:
- `src/components/movemytest/dtc-network-badge.tsx` — UI badge component
- `src/app/api/webhooks/dtc-sync/route.ts` — Webhook for DTC to trigger sync

### Modified files:
- `src/features/movemytest/queries.ts` — Add `source` to queries
- `src/features/movemytest/actions.ts` — Handle DTC listings in actions
- `src/features/movemytest/matching.ts` — Email handling for DTC listings
- `src/features/movemytest/emails.ts` — Skip DTC listings in email scheduling
- `src/scripts/sync-dtc-to-mmt.ts` — Lock file, better logging
- `src/app/(marketing)/dashboard/page.tsx` — Show DTC badge on matches

---

## Data Flow Summary

```
DTC Database                        MoveMyTest Database
┌─────────────────┐                 ┌─────────────────┐
│ TestSwapListing │ ──sync──►       │ Listing         │
│ (ACTIVE only)   │   every 5 min   │ source='DTC'    │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │    DTC user searches                │
         │    (via DTC website)                │    MMT user searches
         │    ──queries DTC DB──►              │    ──queries MMT DB──►
         │                                   │
         └─────────────────┬─────────────────┘
                           │
                    Shared Match Pool
                    (mmt_listings table)
                           │
              ┌────────────┴────────────┐
              │                         │
        ┌─────────┐              ┌─────────┐
        │ Match!  │◄────────────►│ Match!  │
        │ MMT↔DTC │              │ DTC↔MMT │
        └─────────┘              └─────────┘
```

## Open Questions

1. **Should DTC see MMT listings too?** This requires a sync FROM MMT TO DTC (reverse direction). More complex, but creates true shared pool.

2. **Should matches be bidirectional?** If MMT user accepts match with DTC user, does DTC user see it in their DTC dashboard? Requires webhook/API integration.

3. **Data retention:** How long to keep DTC shadow listings after they're deleted in DTC? (Currently: mark EXPIRED, then?)

**Glen — shall I implement Phase 2 now, or do you want to discuss these questions first?**
