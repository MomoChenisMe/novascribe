/**
 * @file 登入速率限制器
 * @description 基於 IP 的 in-memory rate limiter，防止暴力破解攻擊。
 *   - 5 次失敗後鎖定 15 分鐘
 *   - 鎖定期滿自動恢復
 *   - 成功登入後清除計數
 */

/** 最大失敗嘗試次數 */
export const MAX_ATTEMPTS = 5;

/** 鎖定時間（毫秒）：15 分鐘 */
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

interface RateLimitEntry {
  /** 失敗嘗試次數 */
  count: number;
  /** 第一次失敗的時間戳 */
  firstAttempt: number;
  /** 鎖定開始時間（null 表示尚未鎖定） */
  lockedAt: number | null;
}

/** 基於 IP 的速率限制記錄 */
const attempts = new Map<string, RateLimitEntry>();

/**
 * 檢查指定 IP 是否被鎖定
 * @param ip 客戶端 IP 位址
 * @returns 是否被鎖定
 */
export function isRateLimited(ip: string): boolean {
  const entry = attempts.get(ip);
  if (!entry || !entry.lockedAt) {
    return false;
  }

  const now = Date.now();
  const elapsed = now - entry.lockedAt;

  // 鎖定期滿，自動恢復
  if (elapsed >= LOCKOUT_DURATION_MS) {
    attempts.delete(ip);
    return false;
  }

  return true;
}

/**
 * 記錄一次失敗的登入嘗試
 * @param ip 客戶端 IP 位址
 */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry) {
    attempts.set(ip, {
      count: 1,
      firstAttempt: now,
      lockedAt: null,
    });
    return;
  }

  entry.count += 1;

  // 達到最大嘗試次數，鎖定帳號
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedAt = now;
  }
}

/**
 * 清除指定 IP 的失敗記錄（登入成功時呼叫）
 * @param ip 客戶端 IP 位址
 */
export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

/**
 * 取得指定 IP 的剩餘鎖定時間（毫秒）
 * @param ip 客戶端 IP 位址
 * @returns 剩餘鎖定時間（毫秒），0 表示未鎖定
 */
export function getRemainingLockoutTime(ip: string): number {
  const entry = attempts.get(ip);
  if (!entry || !entry.lockedAt) {
    return 0;
  }

  const now = Date.now();
  const elapsed = now - entry.lockedAt;
  const remaining = LOCKOUT_DURATION_MS - elapsed;

  if (remaining <= 0) {
    attempts.delete(ip);
    return 0;
  }

  return remaining;
}

/**
 * 重置所有速率限制記錄（僅供測試使用）
 */
export function resetAllAttempts(): void {
  attempts.clear();
}
