/**
 * @file 種子資料腳本測試
 * @description 驗證 seed 腳本的行為：
 *   - 建立初始管理者帳號
 *   - 使用 upsert 確保可重複執行
 *   - 使用環境變數或預設值
 */

// Mock modules before imports
const mockUpsert = jest.fn();
const mockDisconnect = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      upsert: mockUpsert,
    },
    $disconnect: mockDisconnect,
  },
}));

jest.mock('@/lib/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('$2b$10$mockedhash'),
}));

describe('種子資料腳本', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpsert.mockResolvedValue({
      id: 'test-id',
      email: 'admin@novascribe.local',
      name: 'Admin',
      passwordHash: '$2b$10$mockedhash',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('應呼叫 prisma.user.upsert 建立管理者', async () => {
    const { seed } = await import('../../prisma/seed');
    await seed();

    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          email: expect.any(String),
        }),
        create: expect.objectContaining({
          email: expect.any(String),
          passwordHash: expect.any(String),
        }),
        update: expect.objectContaining({
          passwordHash: expect.any(String),
        }),
      })
    );
  });

  it('應使用環境變數中的 email', async () => {
    process.env.ADMIN_EMAIL = 'custom@test.com';
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { upsert: mockUpsert },
        $disconnect: mockDisconnect,
      },
    }));
    jest.mock('@/lib/password', () => ({
      hashPassword: jest.fn().mockResolvedValue('$2b$10$mockedhash'),
    }));

    const { seed } = await import('../../prisma/seed');
    await seed();

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'custom@test.com' },
      })
    );
  });

  it('未設定環境變數時應使用預設值', async () => {
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_NAME;
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { upsert: mockUpsert },
        $disconnect: mockDisconnect,
      },
    }));
    jest.mock('@/lib/password', () => ({
      hashPassword: jest.fn().mockResolvedValue('$2b$10$mockedhash'),
    }));

    const { seed } = await import('../../prisma/seed');
    await seed();

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'admin@novascribe.local' },
        create: expect.objectContaining({
          name: 'Admin',
        }),
      })
    );
  });

  it('upsert 應同時設定 create 和 update 以支援重複執行', async () => {
    jest.resetModules();
    jest.mock('@/lib/prisma', () => ({
      prisma: {
        user: { upsert: mockUpsert },
        $disconnect: mockDisconnect,
      },
    }));
    jest.mock('@/lib/password', () => ({
      hashPassword: jest.fn().mockResolvedValue('$2b$10$mockedhash'),
    }));

    const { seed } = await import('../../prisma/seed');
    await seed();

    const call = mockUpsert.mock.calls[0][0];
    expect(call).toHaveProperty('where');
    expect(call).toHaveProperty('create');
    expect(call).toHaveProperty('update');
  });
});
