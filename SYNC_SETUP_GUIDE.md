# Sync Setup Guide for Hostinger

## Quick Start

On Hostinger SSH:

```bash
# 1. Create log directory
mkdir -p /home/u385361430/logs

# 2. Test DTC→MMT sync
cd /home/u385361430/domains/movemytest.co.uk/nodejs
node src/scripts/sync-production.js

# 3. If successful, set up cron via Hostinger hPanel:
#    Advanced → Cron Jobs → Add:
#    */5 * * * * cd /home/u385361430/domains/movemytest.co.uk/nodejs && node src/scripts/sync-production.js >> /home/u385361430/logs/sync.log 2>&1
```

## What Just Happened

- `npx` is not available on Hostinger shared hosting
- `sync-production.js` is a **plain Node.js script** — no TypeScript, no build step
- It uses `require('@prisma/client')` directly from `node_modules`
- Just run: `node src/scripts/sync-production.js`

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing DTC_DATABASE_URL` | Add `DTC_DATABASE_URL=...` to `.env` |
| `Cannot find module '@prisma/client'` | Run `npm install` in project root |
| `Access denied for user` | Check DB credentials in `.env` |
| `Table doesn't exist` | Run `npx prisma db push` first |

## Next: Bidirectional Sync

For MMT→DTC sync, create `sync-mmt-to-dtc.js` the same way (plain JS).
