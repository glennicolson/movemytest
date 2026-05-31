# MoveMyTest Tasks

## In Progress
- [x] DTC → MMT sync tested and working (47 listings synced)
- [x] Webhook API specification (WEBHOOK_SPEC.md)
- [x] Webhook library (HMAC signing, verification, retries)
- [x] MMT → DTC webhook sender (match.proposed, accepted, cancelled, completed)
- [x] DTC webhook receiver endpoint (/api/webhooks/mmt)
- [x] MMT webhook receiver endpoint (/api/webhooks/dtc)
- [ ] Update MMT matching engine to send webhooks (IN PROGRESS)
- [ ] Add dtcMatchId field to MMT Match model
- [ ] Test webhook end-to-end
- [ ] Add webhook environment variables to Hostinger
- [ ] Hostinger cron job setup for 5-minute sync
- [ ] Verify DTC Network badge displays correctly on matches

## Done
- [x] Phase 1: Shadow sync table (source, dtcListingId columns)
- [x] Phase 2: Shared pool matching + DTC Network badge
- [x] SEO fixes: schema data, canonicals, OG image, titles
- [x] Production sync script (PHP for Hostinger)
- [x] Database credentials configured for bidirectional access
- [x] Webhook infrastructure (signing, verification, retry logic)

## Next Steps
1. Add `dtcMatchId` field to MMT Match model for cross-reference
2. Deploy webhook endpoints to production
3. Configure environment variables:
   - DTC_WEBHOOK_URL=https://dtc.co.uk/api/webhooks/mmt
   - DTC_WEBHOOK_SECRET=shared_secret_32chars
   - MMT_WEBHOOK_URL=https://movemytest.co.uk/api/webhooks/dtc
   - MMT_WEBHOOK_SECRET=shared_secret_32chars
4. Test match creation triggers webhook
5. Set up cron job (*/5 * * * *)
6. Monitor webhook logs for errors

## Webhook Implementation Summary

### Files Created
- `src/lib/webhook.ts` — Shared webhook utilities (sign, verify, send, retry)
- `src/features/movemytest/webhooks.ts` — MMT → DTC webhook notifications
- `src/app/api/webhooks/mmt/route.ts` — DTC receives webhooks from MMT
- `src/app/api/webhooks/dtc/route.ts` — MMT receives webhooks from DTC
- `WEBHOOK_SPEC.md` — Full API specification

### How It Works
1. MMT user creates listing → matching engine runs
2. If match found with DTC listing (`source='DTC'`)
3. MMT sends `match.proposed` webhook to DTC
4. DTC creates shadow match record in its database
5. DTC user sees match in their DTC dashboard
6. DTC user accepts → DTC sends `match.accepted` webhook to MMT
7. MMT updates match status
8. Both platforms stay in sync via webhooks
