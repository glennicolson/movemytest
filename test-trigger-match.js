const { PrismaClient } = require('@prisma/client');
const { runMatchingForListing } = require('./src/features/movemytest/matching.ts');

const prisma = new PrismaClient();

async function triggerMatch() {
  // Create a new MMT listing that should match with test-dtc-1
  const newMmtListing = await prisma.listing.create({
    data: {
      id: 'test-mmt-2',
      source: 'MMT',
      currentCentreId: 'cmp2zli2d0000a9r70gf89163',
      originalCentreId: 'cmp2zli2d0000a9r70gf89163',
      currentDateTime: new Date('2026-12-01T09:22:00Z'),
      testType: 'WEEKDAY_STANDARD_CAR',
      hasRemainingChange: true,
      desiredDateFrom: new Date('2027-01-04T00:00:00Z'),
      desiredDateTo: new Date('2027-01-04T23:59:59Z'),
      desiredTimePreference: 'ANY',
      desiredCentreIds: ['cmp2zli2d0000a9r70gf89163'],
      desiredDirection: 'LATER',
      status: 'ACTIVE',
      jurisdiction: 'GB_DVSA',
      expiresAt: new Date('2027-12-31T23:59:59Z'),
    },
  });

  console.log('Created MMT listing:', newMmtListing.id);

  // Run matching for the new listing
  await runMatchingForListing(newMmtListing.id);

  console.log('Matching complete');
}

triggerMatch()
  .then(() => console.log('Done'))
  .catch(err => console.error('Error:', err))
  .finally(() => prisma.$disconnect());
