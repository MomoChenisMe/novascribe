/**
 * @file JWT session 管理測試
 * @description 驗證 JWT session 相關行為：
 *   - token 包含 userId/email
 *   - 24 小時過期設定
 *   - session callback 正確傳遞使用者資訊
 */

import { authOptions } from '@/lib/auth';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';

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

describe('JWT session 管理', () => {
  describe('jwt callback', () => {
    const jwtCallback = authOptions.callbacks!.jwt!;

    it('當 user 存在時，token 應包含 userId', async () => {
      const token: JWT = { sub: 'sub-123' };
      const user: User = { id: 'user-456', email: 'test@example.com', name: 'Test' };

      const result = await jwtCallback({
        token,
        user,
        account: null,
        trigger: 'signIn',
      } as Parameters<typeof jwtCallback>[0]);

      expect(result.userId).toBe('user-456');
    });

    it('當 user 存在時，token 應包含 email', async () => {
      const token: JWT = { sub: 'sub-123' };
      const user: User = { id: 'user-456', email: 'test@example.com', name: 'Test' };

      const result = await jwtCallback({
        token,
        user,
        account: null,
        trigger: 'signIn',
      } as Parameters<typeof jwtCallback>[0]);

      expect(result.email).toBe('test@example.com');
    });

    it('當 user 不存在時（後續請求），應保留既有 token', async () => {
      const token: JWT = {
        sub: 'sub-123',
        userId: 'existing-user',
        email: 'existing@example.com',
      };

      const result = await jwtCallback({
        token,
        user: undefined as unknown as User,
        account: null,
        trigger: 'update',
      } as Parameters<typeof jwtCallback>[0]);

      expect(result.userId).toBe('existing-user');
      expect(result.email).toBe('existing@example.com');
    });
  });

  describe('session callback', () => {
    const sessionCallback = authOptions.callbacks!.session!;

    it('session.user 應包含來自 token 的 id', async () => {
      const session: Session = {
        user: { name: 'Test', email: '', image: '' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      const token: JWT = {
        sub: 'sub-123',
        userId: 'user-789',
        email: 'test@example.com',
      };

      const result = await sessionCallback({
        session,
        token,
        trigger: 'update',
        newSession: undefined,
      } as Parameters<typeof sessionCallback>[0]);

      expect((result.user as Record<string, unknown>).id).toBe('user-789');
    });

    it('session.user 應包含來自 token 的 email', async () => {
      const session: Session = {
        user: { name: 'Test', email: '', image: '' },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };
      const token: JWT = {
        sub: 'sub-123',
        userId: 'user-789',
        email: 'test@example.com',
      };

      const result = await sessionCallback({
        session,
        token,
        trigger: 'update',
        newSession: undefined,
      } as Parameters<typeof sessionCallback>[0]);

      expect(result.user?.email).toBe('test@example.com');
    });
  });

  describe('session 設定', () => {
    it('maxAge 應為 24 小時（86400 秒）', () => {
      expect(authOptions.session?.maxAge).toBe(86400);
    });

    it('策略應為 JWT', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
    });
  });
});
