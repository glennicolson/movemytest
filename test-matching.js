const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMatching() {
  const listing = await prisma.listing.findUnique({
    where: { id: 'test-dtc-1', status: 'ACTIVE' },
  });

  if (!listing) {
    console.log('Listing not found');
    return;
  }

  const candidates = await prisma.listing.findMany({
    where: {
      id: { not: 'test-dtc-1' },
      status: 'ACTIVE',
    },
  });

  console.log(`Found ${candidates.length} candidates`);

  for (const candidate of candidates) {
    console.log(`Checking candidate ${candidate.id} (source: ${candidate.source})`);
    
    // Simple check: are the desired directions compatible?
    const aWantsEarlier = listing.desiredDirection === 'EARLIER';
    const bWantsLater = candidate.desiredDirection === 'LATER';
    const aDate = listing.currentDateTime;
    const bDate = candidate.currentDateTime;
    
    if (aWantsEarlier && bWantsLater && aDate > bDate) {
      console.log(`  ✓ Match found! ${listing.id} wants earlier, ${candidate.id} wants later`);
      
      // Create match
      const match = await prisma.match.create({
        data: {
          listingAId: listing.id,
          listingBId: candidate.id,
          score: 100,
          status: 'PROPOSED',
          qualitySummary: 'Test match',
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
      
      console.log(`  Created match: ${match.id}`);
      
      // Send webhook if candidate is from DTC
      if (candidate.source === 'DTC') {
        console.log(`  Would send webhook to DTC for match ${match.id}`);
      }
    } else {
      console.log(`  ✗ No match`);
    }
  }
}

runMatching()
  .then(() => console.log('Done'))
  .catch(err => console.error('Error:', err))
  .finally(() => prisma.$disconnect());
