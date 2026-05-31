# MoveMyTest ↔ DTC Webhook API Specification

## Overview
Webhooks enable real-time bidirectional match notifications between MoveMyTest (MMT) and DTC without sharing databases.

## Security
- **HMAC-SHA256 signatures** on all webhook payloads
- **Shared secrets** stored in environment variables
- **Replay protection** via timestamp validation (±5 min window)
- **IP allowlisting** optional for production hardening

## Webhook Events

### 1. `match.proposed`
Sent when a matching engine proposes a match involving a cross-platform listing.

**MMT → DTC**: When MMT user matches with DTC listing
**DTC → MMT**: When DTC user matches with MMT listing (future)

### 2. `match.accepted`
Sent when one side accepts a cross-platform match.

### 3. `match.booking_reference_shared`
Sent when both sides have shared booking references.

### 4. `match.completed`
Sent when match is marked complete.

### 5. `match.cancelled`
Sent when match is cancelled/expired.

## Payload Format

```json
{
  "event": "match.proposed",
  "timestamp": "2026-05-31T12:00:00Z",
  "webhookId": "wh_1234567890",
  "data": {
    "matchId": "mmt_match_cuid",
    "sourcePlatform": "MMT",
    "targetPlatform": "DTC",
    "sourceListingId": "mmt_listing_id",
    "targetListingId": "dtc_listing_id",
    "score": 85,
    "proposedAt": "2026-05-31T12:00:00Z",
    "expiresAt": "2026-06-14T12:00:00Z",
    "sourceUser": {
      "platform": "MMT",
      "listingId": "mmt_listing_id",
      "testCentre": "Edinburgh (Musselburgh)",
      "testDate": "2026-06-15T09:00:00Z",
      "testType": "WEEKDAY_STANDARD_CAR"
    },
    "targetUser": {
      "platform": "DTC",
      "listingId": "dtc_listing_id",
      "testCentre": "Glasgow (Shieldhall)",
      "testDate": "2026-07-20T14:00:00Z",
      "testType": "WEEKDAY_STANDARD_CAR"
    }
  }
}
```

## Signature Verification

```
Signature = HMAC-SHA256(webhookSecret, timestamp + "." + JSON.stringify(payload))
```

Sent in header: `X-Webhook-Signature: sha256=<hex>`

## Retry Policy
- Immediate first attempt
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Max 5 retries over ~30 seconds
- Dead letter queue after max retries

## Endpoints

### MMT sends to DTC
```
POST https://www.thedtc.co.uk/api/webhooks/mmt
```

### DTC sends to MMT
```
POST https://movemytest.co.uk/api/webhooks/dtc
```

## Response Codes
- `200 OK` - Webhook processed successfully
- `202 Accepted` - Webhook queued for async processing
- `400 Bad Request` - Invalid payload or signature
- `401 Unauthorized` - Missing/invalid signature
- `404 Not Found` - Target listing/user not found
- `410 Gone` - Webhook endpoint deprecated
- `429 Too Many Requests` - Rate limit hit
- `500+` - Retry with backoff

## Implementation Checklist

### Phase 1: MMT → DTC (match.proposed)
- [ ] DTC: Create webhook receiver endpoint
- [ ] DTC: Verify webhook signatures
- [ ] DTC: Create shadow match record from webhook
- [ ] DTC: Notify DTC user via email/dashboard
- [ ] MMT: Send webhook when matching with DTC listing
- [ ] MMT: Retry logic with exponential backoff
- [ ] Both: Add webhook logging

### Phase 2: DTC → MMT (match.proposed)
- [ ] DTC: Send webhook when matching with MMT listing
- [ ] MMT: Create webhook receiver endpoint
- [ ] MMT: Verify webhook signatures
- [ ] MMT: Create shadow match record from webhook

### Phase 3: Match lifecycle webhooks
- [ ] match.accepted
- [ ] match.booking_reference_shared
- [ ] match.completed
- [ ] match.cancelled

## Environment Variables

### MMT
```
DTC_WEBHOOK_URL=https://www.thedtc.co.uk/api/webhooks/mmt
DTC_WEBHOOK_SECRET=whsec_dtc_shared_secret_32chars
WEBHOOK_MAX_RETRIES=5
```

### DTC
```
MMT_WEBHOOK_URL=https://movemytest.co.uk/api/webhooks/dtc
MMT_WEBHOOK_SECRET=whsec_mmt_shared_secret_32chars
WEBHOOK_MAX_RETRIES=5
```
