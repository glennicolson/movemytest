import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});

async function main() {
  const email = "support@movemytest.co.uk";
  const password = "M0v3mYt35t";

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  const passwordHash = salt + "." + hash;

  const existing = await prisma.staffAccount.findUnique({ where: { email } });

  if (existing) {
    const updated = await prisma.staffAccount.update({
      where: { email },
      data: { passwordHash, name: "Support Team" },
    });
    console.log("Updated existing staff account:", updated.id);
  } else {
    const created = await prisma.staffAccount.create({
      data: {
        email,
        name: "Support Team",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log("Created staff account:", created.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
