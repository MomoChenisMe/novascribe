import { prisma } from '@/lib/prisma';

describe('prisma client', () => {
  it('initializes without throwing when DATABASE_URL is set', () => {
    expect(prisma).toBeDefined();
  });
});
