import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});

async function test() {
  console.log("Checking prisma object...");
  console.log("Type:", typeof prisma);
  console.log("staffAccount exists:", "staffAccount" in prisma);

  try {
    const staff = await prisma.staffAccount.findUnique({ 
      where: { email: "support@movemytest.co.uk" } 
    });
    console.log("Result:", !!staff);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
