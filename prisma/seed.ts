/**
 * @file 種子資料腳本
 * @description 建立初始管理者帳號。
 *   - 使用 upsert 確保可重複執行
 *   - 支援環境變數覆蓋預設值
 */

import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

const DEFAULT_ADMIN_EMAIL = 'admin@novascribe.local';
const DEFAULT_ADMIN_PASSWORD = 'changeme123';
const DEFAULT_ADMIN_NAME = 'Admin';

export async function seed(): Promise<void> {
  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || DEFAULT_ADMIN_NAME;

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
    },
    update: {
      name,
      passwordHash,
    },
  });

  console.log(`Seeded admin user: ${user.email} (id: ${user.id})`);
}

// Execute when run directly
const isDirectExecution =
  typeof require !== 'undefined' && require.main === module;

if (isDirectExecution) {
  seed()
    .catch((e) => {
      console.error('Seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
