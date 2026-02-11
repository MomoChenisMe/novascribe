import { PrismaClient } from '../src/generated/prisma/client.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

try {
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
  console.log(`📧 Login email: ${user.email}`);
  console.log(`🔑 Login password: ${password}`);
} catch (error) {
  console.error('❌ Seed failed:', error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
