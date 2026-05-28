import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
prisma.navigationItem.findMany({
  where: { location: "HEADER" },
  orderBy: { sortOrder: "asc" },
  include: { children: { orderBy: { sortOrder: "asc" } } },
})
.then(items => console.log(JSON.stringify(items, null, 2)))
.catch(e => console.error(e))
.finally(() => prisma.$disconnect());
