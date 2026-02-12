/**
 * @file trackEvent 工具函式單元測試
 * @description 測試 GA4 自訂事件追蹤函式
 *   - 正常發送事件到 window.gtag
 *   - gtag 不存在時靜默失敗
 *   - 傳遞事件名稱和參數
 */

import { trackEvent } from '@/lib/analytics';

describe('trackEvent', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset window.gtag
    if (typeof window !== 'undefined') {
      delete (window as Record<string, unknown>).gtag;
    }
  });

  it('應透過 window.gtag 發送事件', () => {
    const mockGtag = jest.fn();
    window.gtag = mockGtag;

    trackEvent('scroll_depth', { percent: 50 });

    expect(mockGtag).toHaveBeenCalledWith('event', 'scroll_depth', {
      percent: 50,
    });
  });

  it('gtag 不存在時應靜默失敗', () => {
    expect(() => trackEvent('test_event')).not.toThrow();
  });

  it('應傳遞事件名稱但不帶參數', () => {
    const mockGtag = jest.fn();
    window.gtag = mockGtag;

    trackEvent('page_view');

    expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', undefined);
  });

  it('應支援複雜參數物件', () => {
    const mockGtag = jest.fn();
    window.gtag = mockGtag;

    trackEvent('outbound_link', {
      url: 'https://example.com',
      link_text: 'Example',
      page_location: '/posts/test',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'outbound_link', {
      url: 'https://example.com',
      link_text: 'Example',
      page_location: '/posts/test',
    });
  });

  it('gtag 為 undefined 時不應拋出錯誤', () => {
    window.gtag = undefined;
    expect(() => trackEvent('test_event', { key: 'value' })).not.toThrow();
  });
});
