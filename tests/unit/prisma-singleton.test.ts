/**
 * @file Prisma Client singleton 單元測試
 * @description 驗證 Prisma Client singleton 行為：
 *   - 開發環境使用 globalThis 快取避免重複建立
 *   - 生產環境每次建立新實例
 *   - 匯出的 prisma 是有效的 PrismaClient 實例
 */

// Mock PrismaClient before importing the module under test
const mockPrismaClient = jest.fn().mockImplementation(() => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  user: {},
}));

jest.mock('@/generated/prisma/client', () => ({
  PrismaClient: mockPrismaClient,
}));

describe('Prisma Client Singleton', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Clear module cache to re-evaluate the singleton module
    jest.resetModules();
    // Re-mock after resetModules
    jest.mock('@/generated/prisma/client', () => ({
      PrismaClient: mockPrismaClient,
    }));
    mockPrismaClient.mockClear();
    // Clean up globalThis
    delete (globalThis as Record<string, unknown>).__prisma;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('應匯出一個有效的 prisma 實例', async () => {
    process.env.NODE_ENV = 'development';
    const { prisma } = await import('@/lib/prisma');
    expect(prisma).toBeDefined();
    expect(mockPrismaClient).toHaveBeenCalledTimes(1);
  });

  it('開發環境下多次匯入應回傳同一實例（singleton）', async () => {
    process.env.NODE_ENV = 'development';
    const mod1 = await import('@/lib/prisma');
    const instance1 = mod1.prisma;

    // Store the instance on globalThis as the module would
    // Re-import should get the same instance from globalThis
    const mod2 = await import('@/lib/prisma');
    const instance2 = mod2.prisma;

    expect(instance1).toBe(instance2);
  });

  it('開發環境下應將實例儲存於 globalThis', async () => {
    process.env.NODE_ENV = 'development';
    await import('@/lib/prisma');
    expect(
      (globalThis as Record<string, unknown>).__prisma
    ).toBeDefined();
  });

  it('生產環境下不應將實例儲存於 globalThis', async () => {
    process.env.NODE_ENV = 'production';
    await import('@/lib/prisma');
    expect(
      (globalThis as Record<string, unknown>).__prisma
    ).toBeUndefined();
  });
});
