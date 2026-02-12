/**
 * @file Rate Limiter（評論系統專用）
 * @description 基於 IP 的記憶體 rate limiter，防止評論洪水攻擊
 *   - 每分鐘最多 3 則評論
 *   - 時間窗口過期自動重置
 *   - 不同 IP 獨立計數
 */

import type { AntiSpamResult } from './anti-spam';

/** 每分鐘最大評論數 */
export const RATE_LIMIT_MAX = 3;

/** 時間窗口（毫秒）：1 分鐘 */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;

interface RateLimitEntry {
  /** 當前時間窗口內的請求次數 */
  count: number;
  /** 時間窗口重置時間戳 */
  resetAt: number;
}

/** 基於 IP 的頻率限制記錄 */
const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * 檢查指定 IP 是否超過頻率限制
 *
 * @param ip - 客戶端 IP 位址
 * @returns 檢查結果
 *
 * @example
 * ```typescript
 * // 第一次請求
 * checkRateLimit('192.168.1.1') // { pass: true }
 *
 * // 第 4 次請求（超過限制）
 * checkRateLimit('192.168.1.1') // { pass: false, reason: 'rate_limit' }
 * ```
 */
export function checkRateLimit(ip: string): AntiSpamResult {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // 第一次請求或時間窗口已過期
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { pass: true };
  }

  // 時間窗口內，檢查計數
  if (entry.count < RATE_LIMIT_MAX) {
    entry.count += 1;
    return { pass: true };
  }

  // 超過限制
  return { pass: false, reason: 'rate_limit' };
}

/**
 * 重置所有 rate limit 記錄（僅供測試使用）
 */
export function resetRateLimiter(): void {
  rateLimitMap.clear();
}
