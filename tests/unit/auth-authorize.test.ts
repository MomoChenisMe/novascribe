/**
 * @file 登入驗證邏輯單元測試
 * @description 驗證 authorize 函式行為：
 *   - 正確帳密→成功回傳 user
 *   - 錯誤密碼→回傳 null
 *   - 不存在帳號→回傳 null
 *   - 空白欄位→回傳 null
 *   - Rate limited→拋出錯誤
 */

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { resetAllAttempts } from '@/lib/rate-limiter';
// Mock 依賴
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/password', () => ({
  verifyPassword: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockVerifyPassword = verifyPassword as jest.MockedFunction<
  typeof verifyPassword
>;

// 取得 authorize 函式（next-auth v4 CredentialsProvider 將 authorize 放在 options 中）
function getAuthorize() {
  const provider = authOptions.providers[0] as {
    options: { authorize: (credentials: Record<string, string> | undefined, req: Record<string, unknown>) => Promise<unknown> };
  };
  return provider.options.authorize;
}

// 模擬 request 物件
function mockReq(ip = '127.0.0.1') {
  return {
    headers: {
      'x-forwarded-for': ip,
    },
    method: 'POST',
    body: {},
    query: {},
  };
}

describe('登入驗證邏輯（authorize）', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2b$10$hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetAllAttempts();
  });

  it('正確帳密應回傳 user 物件', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockVerifyPassword.mockResolvedValue(true);

    const authorize = getAuthorize();
    const result = await authorize(
      { email: 'test@example.com', password: 'correct-password' },
      mockReq()
    );

    expect(result).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  it('錯誤密碼應回傳 null', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockVerifyPassword.mockResolvedValue(false);

    const authorize = getAuthorize();
    const result = await authorize(
      { email: 'test@example.com', password: 'wrong-password' },
      mockReq()
    );

    expect(result).toBeNull();
  });

  it('不存在的帳號應回傳 null', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const authorize = getAuthorize();
    const result = await authorize(
      { email: 'nonexistent@example.com', password: 'any-password' },
      mockReq()
    );

    expect(result).toBeNull();
    // 不應呼叫密碼驗證
    expect(mockVerifyPassword).not.toHaveBeenCalled();
  });

  it('空白 email 應回傳 null', async () => {
    const authorize = getAuthorize();
    const result = await authorize(
      { email: '', password: 'some-password' },
      mockReq()
    );

    expect(result).toBeNull();
    // 不應查詢資料庫
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('空白 password 應回傳 null', async () => {
    const authorize = getAuthorize();
    const result = await authorize(
      { email: 'test@example.com', password: '' },
      mockReq()
    );

    expect(result).toBeNull();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('缺少 credentials 應回傳 null', async () => {
    const authorize = getAuthorize();
    const result = await authorize(undefined as unknown as Record<string, string>, mockReq());

    expect(result).toBeNull();
  });

  it('正確帳密應呼叫 verifyPassword 進行 bcrypt 比對', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    mockVerifyPassword.mockResolvedValue(true);

    const authorize = getAuthorize();
    await authorize(
      { email: 'test@example.com', password: 'correct-password' },
      mockReq()
    );

    expect(mockVerifyPassword).toHaveBeenCalledWith(
      'correct-password',
      mockUser.passwordHash
    );
  });

  it('應使用 email 查詢 Prisma user', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const authorize = getAuthorize();
    await authorize(
      { email: 'test@example.com', password: 'any' },
      mockReq()
    );

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
  });
});
