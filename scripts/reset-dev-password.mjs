// One-shot: reset support@movemytest.co.uk's password on DEV
// Hash format: <salt-hex>.<hash-hex> (matches scripts/create-staff.ts and src/features/admin/auth.ts:61)
//
// Usage: node scripts/reset-dev-password.mjs <new-password-min-8-chars>
import "dotenv/config";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const newPassword = process.argv[2];
if (!newPassword || newPassword.length < 8) {
  console.error("Usage: node scripts/reset-dev-password.mjs <new-password-min-8-chars>");
  process.exit(1);
}

// Refuse to run against non-localhost DB
const dbUrl = process.env.DATABASE_URL || "";
if (!dbUrl.includes("127.0.0.1") && !dbUrl.includes("localhost")) {
  console.error(`Refusing to run: DATABASE_URL host is not localhost/127.0.0.1.`);
  console.error(`  url = ${dbUrl.replace(/:\/\/.*@/, "://***@")}`);
  process.exit(2);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(newPassword, salt, 64).toString("hex");
const passwordHash = salt + "." + hash;

const prisma = new PrismaClient();
const targetEmail = "support@movemytest.co.uk";

try {
  const existing = await prisma.staffAccount.findUnique({ where: { email: targetEmail } });
  if (!existing) {
    console.error(`No StaffAccount with email ${targetEmail} in dev DB.`);
    process.exit(3);
  }
  console.log(`Found: id=${existing.id} email=${existing.email} role=${existing.role}`);
  console.log(`Old hash: ${existing.passwordHash?.slice(0, 30)}...`);
  console.log(`New hash: ${passwordHash.slice(0, 30)}...`);

  await prisma.staffAccount.update({
    where: { email: targetEmail },
    data: { passwordHash },
  });

  // Verify by reading it back and running the same scrypt comparison the
  // app does at sign-in (src/features/admin/auth.ts:61-67)
  const read = await prisma.staffAccount.findUnique({ where: { email: targetEmail } });
  const [rSalt, rHash] = read.passwordHash.split(".");
  const verify = scryptSync(newPassword, rSalt, 64).toString("hex");
  const ok = timingSafeEqual(Buffer.from(rHash), Buffer.from(verify));
  console.log(`Self-verify: ${ok ? "OK ✅" : "FAILED ❌"}`);

  console.log(`\n✅ Password reset for ${targetEmail} on DEV`);
  console.log(`   New password: ${newPassword}`);
} catch (err) {
  console.error("Reset failed:", err.message);
  process.exit(4);
} finally {
  await prisma.$disconnect();
}
