/**
 * @file 登入速率限制測試
 * @description 驗證 rate limiter 行為：
 *   - 5 次失敗後鎖定
 *   - 鎖定期間拒絕請求
 *   - 15 分鐘後自動恢復
 *   - 成功登入後清除計數
 *   - 不同 IP 獨立計算
 */

import {
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
  getRemainingLockoutTime,
  resetAllAttempts,
  MAX_ATTEMPTS,
  LOCKOUT_DURATION_MS,
} from '@/lib/rate-limiter';

describe('登入速率限制', () => {
  beforeEach(() => {
    resetAllAttempts();
    jest.restoreAllMocks();
  });

  it('MAX_ATTEMPTS 應為 5', () => {
    expect(MAX_ATTEMPTS).toBe(5);
  });

  it('LOCKOUT_DURATION_MS 應為 15 分鐘', () => {
    expect(LOCKOUT_DURATION_MS).toBe(15 * 60 * 1000);
  });

  it('初始狀態不應被限制', () => {
    expect(isRateLimited('192.168.1.1')).toBe(false);
  });

  it('少於 5 次失敗不應被鎖定', () => {
    const ip = '192.168.1.1';
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(ip);
    }
    expect(isRateLimited(ip)).toBe(false);
  });

  it('5 次失敗後應被鎖定', () => {
    const ip = '192.168.1.1';
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(ip);
    }
    expect(isRateLimited(ip)).toBe(true);
  });

  it('超過 5 次失敗仍應被鎖定', () => {
    const ip = '192.168.1.1';
    for (let i = 0; i < 7; i++) {
      recordFailedAttempt(ip);
    }
    expect(isRateLimited(ip)).toBe(true);
  });

  it('鎖定期間 getRemainingLockoutTime 應回傳正值', () => {
    const ip = '192.168.1.1';
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(ip);
    }
    const remaining = getRemainingLockoutTime(ip);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(LOCKOUT_DURATION_MS);
  });

  it('未鎖定時 getRemainingLockoutTime 應回傳 0', () => {
    expect(getRemainingLockoutTime('192.168.1.1')).toBe(0);
  });

  it('鎖定期滿後應自動恢復', () => {
    const ip = '192.168.1.1';

    // 模擬 Date.now()
    const originalNow = Date.now;
    const baseTime = 1000000;
    Date.now = jest.fn(() => baseTime);

    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(ip);
    }
    expect(isRateLimited(ip)).toBe(true);

    // 經過 15 分鐘
    Date.now = jest.fn(() => baseTime + LOCKOUT_DURATION_MS);
    expect(isRateLimited(ip)).toBe(false);

    Date.now = originalNow;
  });

  it('鎖定期間（未滿 15 分鐘）仍應被鎖定', () => {
    const ip = '192.168.1.1';

    const originalNow = Date.now;
    const baseTime = 1000000;
    Date.now = jest.fn(() => baseTime);

    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(ip);
    }

    // 經過 14 分鐘（未滿）
    Date.now = jest.fn(() => baseTime + 14 * 60 * 1000);
    expect(isRateLimited(ip)).toBe(true);

    Date.now = originalNow;
  });

  it('成功登入後應清除失敗計數', () => {
    const ip = '192.168.1.1';
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(ip);
    }
    clearAttempts(ip);

    // 再失敗 4 次不應鎖定（因為計數已清除）
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(ip);
    }
    expect(isRateLimited(ip)).toBe(false);
  });

  it('鎖定狀態也應可被 clearAttempts 清除', () => {
    const ip = '192.168.1.1';
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(ip);
    }
    expect(isRateLimited(ip)).toBe(true);

    clearAttempts(ip);
    expect(isRateLimited(ip)).toBe(false);
  });

  it('不同 IP 應獨立計算', () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';

    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(ip1);
    }

    expect(isRateLimited(ip1)).toBe(true);
    expect(isRateLimited(ip2)).toBe(false);
  });

  it('resetAllAttempts 應清除所有記錄', () => {
    recordFailedAttempt('ip1');
    recordFailedAttempt('ip2');
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt('ip3');
    }

    resetAllAttempts();

    expect(isRateLimited('ip1')).toBe(false);
    expect(isRateLimited('ip2')).toBe(false);
    expect(isRateLimited('ip3')).toBe(false);
  });
});
