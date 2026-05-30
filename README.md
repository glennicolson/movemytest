# MoveMyTest

**Standalone test date swapping service for learner drivers.**

## Overview

MoveMyTest is a standalone web application that allows learner drivers to swap their driving test dates with other learners. Originally part of the DTC (Driver Training Centre) ecosystem, it is being separated into an independent service to serve both DTC learners and independent instructors equally.

## Architecture

MoveMyTest operates as a completely standalone service:
- **Own database** (MySQL on port 3309)
- **Own codebase** (Next.js app in `/movemytest`)
- **Own deployment** (separate from DTC)
- **Shared match pool** (via shadow sync with DTC — see `MMT_SHARED_POOL_PLAN.md`)

## Tech Stack

- **Framework:** Next.js 15
- **Database:** MySQL + Prisma ORM
- **Auth:** Custom auth (email/password)
- **Styling:** Tailwind CSS
- **Deployment:** Hostinger (planned)

## Database

Located at `prisma/schema.prisma` — completely independent from DTC schema.

Key models:
- `LearnerAccount` — user accounts
- `Listing` — test date listings
- `MatchEvent` — swap matches
- `TestCentre` — UK test centres (shared data)

## Shared Match Pool (Future)

See `MMT_SHARED_POOL_PLAN.md` for the phased plan to integrate with DTC's test swap data without compromising independence.

## Development

```bash
cd /Users/glennicolson/.openclaw/workspace/movemytest
npm install
npx prisma generate
npm run dev  # Runs on default Next.js port
```

## Status

- ✅ Prisma schema extracted from DTC (TestSwap tables isolated)
- ✅ Basic Next.js app structure in place
- ✅ Database connection configured
- ⬜ Phase 1: Full standalone functionality
- ⬜ Phase 2: Shared match pool sync
- ⬜ Phase 3+: See `MMT_SHARED_POOL_PLAN.md`

## Decision: Shared Pool Strategy

**Chosen approach:** Option A — Shadow sync table
- DTC test swap data stays in DTC
- MoveMyTest gets its own database
- Shared `mmt_listings` table aggregates listings from both platforms
- Independent instructors never see DTC branding
- DTC learners benefit from larger swap network

See `MMT_SHARED_POOL_PLAN.md` for full implementation plan.

---

**Decision Date:** 2026-05-30  
**Decision Maker:** Glen  
**Plan Author:** Jarvis
