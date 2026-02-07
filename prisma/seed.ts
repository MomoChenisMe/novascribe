import { PrismaClient } from "../src/generated/prisma/client";
import { hashSync } from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
});

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@novascribe.com" },
    update: {},
    create: {
      email: "admin@novascribe.com",
      name: "Admin",
      password: hashSync("Admin123", 12),
      role: "admin",
      status: "active",
    },
  });

  console.log("Seeded admin user:", admin.email);

  const defaultCategory = await prisma.category.upsert({
    where: { slug: "uncategorized" },
    update: {},
    create: {
      name: "未分類",
      slug: "uncategorized",
    },
  });

  console.log("Seeded category:", defaultCategory.name);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
