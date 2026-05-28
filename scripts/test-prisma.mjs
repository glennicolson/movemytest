import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("staffAccount model exists:", !!prisma.staffAccount);
prisma.staffAccount.findUnique({ where: { email: "support@movemytest.co.uk" } }).then((r) => {
  console.log("Found staff:", !!r);
  prisma.$disconnect();
});
