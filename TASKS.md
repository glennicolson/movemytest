# MoveMyTest Tasks

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
