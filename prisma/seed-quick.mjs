import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const email = process.env.ADMIN_EMAIL || 'admin@novascribe.local';
const password = process.env.ADMIN_PASSWORD || 'changeme123';
const name = process.env.ADMIN_NAME || 'Admin';

const passwordHash = await bcrypt.hash(password, 10);

const user = await prisma.user.upsert({
  where: { email },
  create: { email, name, passwordHash },
  update: { name, passwordHash },
});

console.log(`✅ Seeded admin user: ${user.email} (id: ${user.id})`);

await prisma.$disconnect();
