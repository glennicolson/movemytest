# Bidirectional Sync Environment Variables

**Date:** 2026-05-30
**For:** Glen (both DTC and MoveMyTest sites)

---

## DTC Site Environment Variables (`.env.hostinger`)

Add these to the DTC Hostinger environment:

```env
# ── MoveMyTest Sync (DTC → MMT) ──
# Read-only access to MoveMyTest database for syncing listings
MMT_DATABASE_URL=mysql://mmt_readonly:PASSWORD@movemytest-db-host:3306/movemytest?schema=public

# Webhook secret for validating incoming sync triggers from MMT
MMT_SYNC_WEBHOOK_SECRET=your-secure-random-string-here

# Feature flag
SYNC_ENABLED=true
SYNC_INTERVAL_MINUTES=5

# MMT API endpoint (for triggering MMT→DTC sync)
MMT_API_BASE_URL=https://movemytest.co.uk
```

---

## MoveMyTest Site Environment Variables (`.env`)

Add these to the MoveMyTest Hostinger environment:

```env
# ── DTC Sync (MMT → DTC) ──
# Read-only access to DTC database for syncing listings
DTC_DATABASE_URL=mysql://dtc_readonly:PASSWORD@dtc-db-host:3306/dtc_main?schema=public

# Webhook secret for validating incoming sync triggers from DTC
DTC_SYNC_WEBHOOK_SECRET=your-secure-random-string-here

# Feature flag
SYNC_ENABLED=true
SYNC_INTERVAL_MINUTES=5

# DTC API endpoint (for triggering DTC→MMT sync)
DTC_API_BASE_URL=https://www.thedtc.co.uk
```

---

## Database Users Required

### On DTC Database (MySQL/MariaDB)
```sql
-- Create read-only user for MMT sync
CREATE USER 'mmt_readonly'@'%' IDENTIFIED BY 'strong-password-here';
GRANT SELECT ON dtc_main.TestSwapListing TO 'mmt_readonly'@'%';
GRANT SELECT ON dtc_main.TestSwapMatch TO 'mmt_readonly'@'%';
GRANT SELECT ON dtc_main.TestSwapMatchEvent TO 'mmt_readonly'@'%';
GRANT SELECT ON dtc_main.TestSwapLearnerAccount TO 'mmt_readonly'@'%';
GRANT SELECT ON dtc_main.TestSwapInstructorAccount TO 'mmt_readonly'@'%';
FLUSH PRIVILEGES;
```

### On MoveMyTest Database (MySQL/MariaDB)
```sql
-- Create read-only user for DTC sync
CREATE USER 'dtc_readonly'@'%' IDENTIFIED BY 'strong-password-here';
GRANT SELECT ON movemytest.Listing TO 'dtc_readonly'@'%';
GRANT SELECT ON movemytest.Match TO 'dtc_readonly'@'%';
GRANT SELECT ON movemytest.MatchEvent TO 'dtc_readonly'@'%';
GRANT SELECT ON movemytest.LearnerAccount TO 'dtc_readonly'@'%';
GRANT SELECT ON movemytest.InstructorAccount TO 'dtc_readonly'@'%';
FLUSH PRIVILEGES;
```

---

## Architecture

```
┌─────────────────────┐                    ┌─────────────────────┐
│   DTC Website       │                    │   MoveMyTest.com      │
│   (thedtc.co.uk)    │                    │   (movemytest.co.uk)  │
│                     │                    │                       │
│  Database: dtc_main │◄────── sync ─────►│  Database: movemytest │
│  Tables:            │   every 5 min      │  Tables:              │
│  - TestSwapListing  │                    │  - Listing            │
│  - TestSwapMatch    │                    │  - Match              │
│  - TestSwapAccount  │                    │  - Account            │
└─────────────────────┘                    └─────────────────────┘
         │                                           │
         │  DTC_DATABASE_URL (MMT reads DTC)         │
         │  MMT_DATABASE_URL (DTC reads MMT)         │
         │                                           │
    ┌────┴───────────────────────────────────────────┴────┐
    │               Shared Match Pool                      │
    │  Both platforms query unified listing view          │
    │  DTC users see DTC + MMT listings                   │
    │  MMT users see MMT + DTC listings                   │
    └─────────────────────────────────────────────────────┘
```

---

## Sync Flow

### DTC → MMT Direction
1. DTC sync script queries `TestSwapListing` (ACTIVE only)
2. Transforms DTC schema → MMT schema
3. Inserts/updates MMT `Listing` table with `source='DTC'`
4. Marks withdrawn DTC listings as EXPIRED in MMT

### MMT → DTC Direction
1. MMT sync script queries `Listing` (ACTIVE only, source='MMT')
2. Transforms MMT schema → DTC schema
3. Inserts/updates DTC `TestSwapListing` table (flagged as MMT origin)
4. Marks withdrawn MMT listings as EXPIRED in DTC

### Match Sync (Bidirectional)
- When match created on either platform:
  1. Webhook to other platform
  2. Other platform creates shadow match record
  3. Notifications sent from respective platform

---

## Security Considerations

1. **Read-only database users** — Sync scripts only SELECT from foreign database
2. **Webhook secrets** — HMAC validation on all sync triggers
3. **IP whitelisting** — Database access restricted to known server IPs
4. **No PII sync** — Only listing-level data (centre, date, type), no names/addresses
5. **HTTPS only** — All webhook calls over TLS

---

## Hostinger-Specific Notes

Both sites are on Hostinger. Options for database connectivity:

### Option A: Same Database Server (Recommended)
If both databases are on the same Hostinger MySQL server:
- Use `localhost` or `127.0.0.1` for both connections
- No external network exposure
- Fastest performance

### Option B: Remote Database Access
If databases are on different servers:
1. Whitelist each server's IP in Hostinger firewall
2. Use internal Hostinger network IPs (not public)
3. SSL/TLS encryption mandatory

---

## Files to Update

### DTC Site
- `.env.hostinger` — add MMT sync variables
- `src/features/test-swap/sync-to-mmt.ts` — create sync script
- `src/app/api/webhooks/mmt-sync/route.ts` — webhook handler

### MoveMyTest Site
- `.env` — add DTC sync variables (already has `DTC_DATABASE_URL` pattern)
- `src/scripts/sync-dtc-to-mmt.ts` — update for production credentials
- `src/app/api/webhooks/dtc-sync/route.ts` — webhook handler

---

## Glen — Action Required

1. **Confirm database locations**: Are DTC and MMT databases on the same Hostinger MySQL server?
2. **Create database users**: Run the SQL above to create readonly users
3. **Set passwords**: Choose strong passwords for `mmt_readonly` and `dtc_readonly`
4. **Update .env files**: Add the variables above to both sites
5. **Test connectivity**: Verify each site can connect to the other's database

**Next step**: Once you provide the database details, I'll update the sync scripts with proper connection handling and webhook security.
