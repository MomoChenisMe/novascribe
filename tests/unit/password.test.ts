/**
 * @file 密碼雜湊工具函式測試
 * @description 驗證 hashPassword 和 verifyPassword 的行為：
 *   - bcrypt 使用 10+ rounds
 *   - 雜湊結果不等於明文
 *   - 正確密碼可通過驗證
 *   - 錯誤密碼無法通過驗證
 *   - 明文密碼不會被記錄到日誌
 */

import { hashPassword, verifyPassword } from '@/lib/password';

describe('密碼雜湊工具函式', () => {
  describe('hashPassword', () => {
    it('應回傳雜湊後的密碼字串', async () => {
      const hash = await hashPassword('mypassword');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('雜湊結果不應等於明文密碼', async () => {
      const password = 'mypassword';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
    });

    it('應使用 bcrypt 格式（$2b$ 前綴）', async () => {
      const hash = await hashPassword('mypassword');
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('應使用 10 rounds 以上', async () => {
      const hash = await hashPassword('mypassword');
      // bcrypt hash format: $2b$XX$ where XX is the cost factor
      const costMatch = hash.match(/^\$2[aby]\$(\d+)\$/);
      expect(costMatch).not.toBeNull();
      const rounds = parseInt(costMatch![1], 10);
      expect(rounds).toBeGreaterThanOrEqual(10);
    });

    it('同一密碼每次雜湊結果應不同（不同 salt）', async () => {
      const password = 'mypassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('正確密碼應通過驗證', async () => {
      const password = 'correctpassword';
      const hash = await hashPassword(password);
      const result = await verifyPassword(password, hash);
      expect(result).toBe(true);
    });

    it('錯誤密碼不應通過驗證', async () => {
      const hash = await hashPassword('correctpassword');
      const result = await verifyPassword('wrongpassword', hash);
      expect(result).toBe(false);
    });

    it('空字串密碼不應通過驗證（與非空雜湊比對）', async () => {
      const hash = await hashPassword('somepassword');
      const result = await verifyPassword('', hash);
      expect(result).toBe(false);
    });
  });

  describe('安全性', () => {
    it('不應在日誌中記錄明文密碼', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation();
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();
      const consoleInfoSpy = jest
        .spyOn(console, 'info')
        .mockImplementation();

      const password = 'super-secret-password-12345';
      await hashPassword(password);
      await verifyPassword(password, await hashPassword(password));

      const allLogs = [
        ...consoleSpy.mock.calls.flat().map(String),
        ...consoleWarnSpy.mock.calls.flat().map(String),
        ...consoleErrorSpy.mock.calls.flat().map(String),
        ...consoleInfoSpy.mock.calls.flat().map(String),
      ];

      for (const log of allLogs) {
        expect(log).not.toContain(password);
      }

      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleInfoSpy.mockRestore();
    });
  });
});
