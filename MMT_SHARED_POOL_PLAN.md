# MoveMyTest Shared Match Pool Plan

**Date:** 2026-05-30  
**Status:** ✅ Plan agreed — awaiting MoveMyTest standalone setup  
**Decision Maker:** Glen

---

## Problem Statement

The test swap service is currently embedded in the DTC website. Independent instructors see DTC as a competitor, so they won't use the service. We need to separate MoveMyTest into its own brand while maintaining a shared match pool so all users benefit from the larger network.

---

## Architecture: Shared Match Pool with Shadow Accounts (Option A)

### Goal
- **MoveMyTest** becomes a completely standalone service with its own database, branding, and domain
- **DTC learners** continue using test swap via DTC, but their listings appear in the shared pool
- **Independent instructors** use MoveMyTest directly, with no DTC branding or perceived competition
- **Shared match pool** — users from both platforms can swap with each other
- **Zero risk to DTC data** — DTC learner data stays in DTC database

---

## Implementation Phases

### Phase 1: MoveMyTest Standalone Setup ✅ FIRST
**Status:** Pending — MUST be completed before Phase 2

**Tasks:**
1. Ensure MoveMyTest is fully functional as a standalone Next.js app
2. Verify database connection (MySQL on port 3309)
3. Confirm all core features work (account creation, listing creation, matching)
4. Establish independent branding (no DTC logos/colors)
5. Set up separate deployment pipeline (Hostinger or other)

**Why first:** We need a working standalone product before we can sync data to it. No point building a sync pipeline to an incomplete system.

---

### Phase 2: Create Shadow Sync Table
**Status:** Ready to implement after Phase 1

**What:**
- Create `mmt_listings` table in MoveMyTest database
- Create `mmt_match_events` table in MoveMyTest database
- Build sync script that copies DTC `TestSwapListing` (ACTIVE status only) to `mmt_listings`
- Add `source` column to identify listing origin (`DTC` or `MMT`)

**Schema:**
```sql
-- MoveMyTest database additions:
CREATE TABLE mmt_listings (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  testDate DATE NOT NULL,
  currentTestCentreId VARCHAR(191),
  desiredTestCentreId VARCHAR(191),
  status ENUM('ACTIVE', 'MATCHED', 'WITHDRAWN'),
  source ENUM('DTC', 'MMT') NOT NULL,
  dtcListingId VARCHAR(191) NULL,      -- FK to DTC.TestSwapListing (nullable)
  createdAt DATETIME DEFAULT NOW(),
  updatedAt DATETIME DEFAULT NOW(),
  
  INDEX idx_status_date (status, testDate),
  INDEX idx_source (source),
  INDEX idx_dtc_listing (dtcListingId)
);
```

**Sync Mechanism:**
- Runs every 5 minutes via cron job or background worker
- Pulls only ACTIVE listings from DTC.TestSwapListing
- Inserts/updates into `mmt_listings` with `source='DTC'`
- MMT listings created directly via MMT app with `source='MMT'`

---

### Phase 3: MoveMyTest Reads from Shared Pool
**Status:** Ready to implement after Phase 2

**What:**
- Update MoveMyTest search API to query `mmt_listings`
- DTC listings appear alongside MMT listings in search results
- Optional: DTC listings show subtle "DTC Network" badge
- Optional: MMT listings show "Independent" badge

**API Flow:**
```
MoveMyTest user searches for swaps:
  GET /api/listings?centre=BD20&dateFrom=2026-06-01&dateTo=2026-06-30
    → Queries mmt_listings table
    → Returns listings from BOTH DTC and MMT
    → Both pools visible in unified search
```

---

### Phase 4: Bidirectional Matching
**Status:** Ready to implement after Phase 3

**What:**
- When a DTC user matches with an MMT user:
  - Match record stored in DTC database (`TestSwapMatch`)
  - Match record stored in MoveMyTest database (`mmt_match_events`)
- Email notifications sent from respective systems
- Match status synchronized between both databases

**Sync Logic:**
- DTC match creates → webhook → MoveMyTest creates shadow match
- MoveMyTest match creates → webhook → DTC creates shadow match
- Both systems show complete match history

---

### Phase 5: Complete Brand Separation
**Status:** Future — after Phase 4 proven stable

**What:**
- MoveMyTest gets its own domain (e.g., movemytest.co.uk)
- DTC test swap page becomes a branded embed or redirect
- Complete visual and functional independence
- DTC learners can still use test swap via DTC (no forced migration)

---

## Data Flow Diagram

```
┌─────────────────┐         ┌──────────────────┐
│   DTC Website   │         │  MoveMyTest.com  │
│   (dtc_main)    │         │  (movemytest)    │
│                 │         │                  │
│  TestSwap tables│◄───────►│  MMT tables      │
│  (DTC learners) │  sync   │  (independents)  │
└─────────────────┘         └──────────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────────────┐
              │  Shared View  │
              │ (mmt_listings)│
              └──────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
   ┌─────────┐           ┌─────────┐
   │ DTC User│◄─────────►│ MMT User│
   │ Search  │   Match!  │ Search  │
   └─────────┘           └─────────┘
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| DTC data leaked to MoveMyTest | Only copy listing-level data (email, test date, centre). No learner profile data. |
| Sync failure | Sync script logs errors. DTC listings remain in DTC database (source of truth). |
| MoveMyTest database corrupted | DTC database is source of truth. MoveMyTest can be rebuilt from DTC. |
| Performance impact | Sync runs async (every 5 min). No blocking of DTC operations. |
| Schema drift | Versioned sync script. Changes to DTC TestSwap schema require sync script update. |

---

## Decision Log

**Decision:** Glen chose Option A (Shared Match Pool with Shadow Accounts) over:
- Option B: API-only sharing (more complex, latency issues)
- Option C: Row-level security in shared database (too risky)

**Reasoning:** Option A provides complete data isolation, independent branding, and shared match pool with minimal risk.

**Next Step:** Complete MoveMyTest standalone setup (Phase 1) before proceeding to Phase 2.

---

## Files Created

- `/Users/glennicolson/.openclaw/workspace/movemytest/MMT_SHARED_POOL_PLAN.md` — This file
