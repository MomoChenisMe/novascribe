/**
 * @file GA4 Analytics 追蹤工具函式
 * @description 提供 GA4 自訂事件追蹤能力
 *   - trackEvent: 發送自訂事件到 GA4
 *   - gtag 不存在時靜默失敗，不拋出錯誤
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * 發送 GA4 自訂事件
 * @param eventName 事件名稱（如 'scroll_depth', 'read_time', 'outbound_link'）
 * @param params 事件參數
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
