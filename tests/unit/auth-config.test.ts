/**
 * @file NextAuth.js 設定測試
 * @description 驗證 NextAuth.js 設定：
 *   - 使用 Credentials Provider
 *   - JWT session 策略
 *   - 自訂登入頁面 /login
 *   - session maxAge 為 24 小時
 */

import { authOptions } from '@/lib/auth';

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

describe('NextAuth.js 設定', () => {
  it('應使用 Credentials Provider', () => {
    expect(authOptions.providers).toHaveLength(1);
    // next-auth Credentials provider has id "credentials"
    const provider = authOptions.providers[0] as { id: string; name: string };
    expect(provider.id).toBe('credentials');
  });

  it('應使用 JWT session 策略', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
  });

  it('session maxAge 應為 24 小時（86400 秒）', () => {
    expect(authOptions.session?.maxAge).toBe(24 * 60 * 60);
  });

  it('自訂登入頁面應為 /login', () => {
    expect(authOptions.pages?.signIn).toBe('/login');
  });

  it('應定義 jwt callback', () => {
    expect(authOptions.callbacks?.jwt).toBeDefined();
    expect(typeof authOptions.callbacks?.jwt).toBe('function');
  });

  it('應定義 session callback', () => {
    expect(authOptions.callbacks?.session).toBeDefined();
    expect(typeof authOptions.callbacks?.session).toBe('function');
  });
});
