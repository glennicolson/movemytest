const axios = require('axios');
const crypto = require('crypto');

// Webhook configuration
const DTC_WEBHOOK_URL = 'https://www.thedtc.co.uk/api/webhooks/mmt';
const DTC_WEBHOOK_SECRET = 'whsec_7a3f9e2b8c5d1e4f6a0b9c8d7e3f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6';

function signWebhookPayload(secret, payload) {
  const timestamp = payload.timestamp;
  const body = JSON.stringify(payload);
  const signedPayload = `${timestamp}.${body}`;
  return crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
}

async function sendWebhook() {
  const payload = {
    event: 'match.proposed',
    timestamp: new Date().toISOString(),
    webhookId: `wh_${crypto.randomBytes(12).toString('hex')}`,
    data: {
      matchId: 'cmptm23yj0001650i1uwkao53',
      sourcePlatform: 'MMT',
      targetPlatform: 'DTC',
      sourceListingId: 'test-mmt-1',
      targetListingId: 'test-dtc-1',
      score: 100,
      proposedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      sourceUser: {
        platform: 'MMT',
        listingId: 'test-mmt-1',
        testCentre: 'cmp2zli2d0000a9r70gf89163',
        testDate: '2026-12-01T09:22:00.000Z',
        testType: 'WEEKDAY_STANDARD_CAR',
        desiredDateFrom: '2027-01-04T00:00:00.000Z',
        desiredDateTo: '2027-01-04T23:59:59.000Z',
        desiredDirection: 'LATER',
      },
      targetUser: {
        platform: 'DTC',
        listingId: 'test-dtc-1',
        testCentre: 'cmp2zli2d0000a9r70gf89163',
        testDate: '2027-01-04T10:57:00.000Z',
        testType: 'WEEKDAY_STANDARD_CAR',
        desiredDateFrom: '2026-12-01T00:00:00.000Z',
        desiredDateTo: '2026-12-01T23:59:59.000Z',
        desiredDirection: 'EARLIER',
      },
    },
  };

  const signature = signWebhookPayload(DTC_WEBHOOK_SECRET, payload);

  try {
    const response = await axios.post(DTC_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-ID': payload.webhookId,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp,
      },
      timeout: 10000,
    });

    console.log('Webhook sent successfully!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Webhook failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
  }
}

sendWebhook();
