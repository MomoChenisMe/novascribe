/**
 * @file Prisma Client singleton
 * @description 提供全域唯一的 PrismaClient 實例。
 *   - 開發環境：使用 globalThis 快取避免 HMR 時重複建立連線
 *   - 生產環境：每次建立新實例
 */

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing');
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ 
    adapter,
    log: ['query', 'error', 'warn']
  });
}

export const prisma: PrismaClient =
  process.env.NODE_ENV === 'production'
    ? createPrismaClient()
    : (globalForPrisma.__prisma ??= createPrismaClient());
