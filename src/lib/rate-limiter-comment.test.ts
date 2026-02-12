/**
 * @file Rate Limiter 測試（評論系統專用）
 * @description 測試 IP 頻率限制功能
 */

import {
  checkRateLimit,
  resetRateLimiter,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from './rate-limiter-comment';

describe('checkRateLimit', () => {
  beforeEach(() => {
    // 每個測試前清空狀態
    resetRateLimiter();
  });

  it('第一次請求時允許通過', () => {
    const result = checkRateLimit('192.168.1.1');
    expect(result.pass).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('同 IP 在限制內連續請求時允許通過', () => {
    const ip = '192.168.1.1';

    // 前 3 次請求應該都通過
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      const result = checkRateLimit(ip);
      expect(result.pass).toBe(true);
    }
  });

  it('同 IP 超過頻率限制時拒絕', () => {
    const ip = '192.168.1.1';

    // 前 3 次通過
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      checkRateLimit(ip);
    }

    // 第 4 次應該被拒絕
    const result = checkRateLimit(ip);
    expect(result.pass).toBe(false);
    expect(result.reason).toBe('rate_limit');
  });

  it('不同 IP 獨立計數', () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';

    // IP1 達到限制
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      checkRateLimit(ip1);
    }

    // IP1 被拒絕
    expect(checkRateLimit(ip1).pass).toBe(false);

    // IP2 應該仍能通過
    expect(checkRateLimit(ip2).pass).toBe(true);
  });

  it('時間窗口過期後自動重置計數', () => {
    const ip = '192.168.1.1';

    // 模擬當前時間
    const originalNow = Date.now;
    let mockTime = Date.now();
    Date.now = jest.fn(() => mockTime);

    // 達到限制
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      checkRateLimit(ip);
    }

    // 確認被拒絕
    expect(checkRateLimit(ip).pass).toBe(false);

    // 時間前進超過窗口時間
    mockTime += RATE_LIMIT_WINDOW_MS + 1000;

    // 應該重新允許
    const result = checkRateLimit(ip);
    expect(result.pass).toBe(true);

    // 恢復 Date.now
    Date.now = originalNow;
  });

  it('時間窗口內計數累積正確', () => {
    const ip = '192.168.1.1';

    // 第 1 次
    expect(checkRateLimit(ip).pass).toBe(true);

    // 第 2 次
    expect(checkRateLimit(ip).pass).toBe(true);

    // 第 3 次（最後一次允許）
    expect(checkRateLimit(ip).pass).toBe(true);

    // 第 4 次（拒絕）
    expect(checkRateLimit(ip).pass).toBe(false);

    // 第 5 次（仍拒絕）
    expect(checkRateLimit(ip).pass).toBe(false);
  });

  it('resetRateLimiter 清空所有記錄', () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';

    // 兩個 IP 都達到限制
    for (let i = 0; i < RATE_LIMIT_MAX + 1; i++) {
      checkRateLimit(ip1);
      checkRateLimit(ip2);
    }

    // 確認都被拒絕
    expect(checkRateLimit(ip1).pass).toBe(false);
    expect(checkRateLimit(ip2).pass).toBe(false);

    // 重置
    resetRateLimiter();

    // 應該重新允許
    expect(checkRateLimit(ip1).pass).toBe(true);
    expect(checkRateLimit(ip2).pass).toBe(true);
  });
});
