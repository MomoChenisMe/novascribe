/**
 * @file ReadTimeTracker 元件 RTL 測試
 * @description 測試閱讀時間追蹤元件
 *   - 離開頁面時（visibilitychange / beforeunload）發送閱讀時間
 */

import React from 'react';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';

// Mock trackEvent
const mockTrackEvent = jest.fn();
jest.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

import { ReadTimeTracker } from '@/components/analytics/ReadTimeTracker';

describe('ReadTimeTracker', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('頁面隱藏時應發送閱讀時間', () => {
    render(<ReadTimeTracker />);

    // 經過 5 秒
    jest.advanceTimersByTime(5000);

    // 觸發 visibilitychange（頁面隱藏）
    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    fireEvent(document, new Event('visibilitychange'));

    expect(mockTrackEvent).toHaveBeenCalledWith('read_time', {
      seconds: 5,
    });
  });

  it('beforeunload 時應發送閱讀時間', () => {
    render(<ReadTimeTracker />);

    jest.advanceTimersByTime(10000);

    fireEvent(window, new Event('beforeunload'));

    expect(mockTrackEvent).toHaveBeenCalledWith('read_time', {
      seconds: 10,
    });
  });

  it('頁面可見時不應發送事件', () => {
    render(<ReadTimeTracker />);

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
    fireEvent(document, new Event('visibilitychange'));

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('不應渲染任何 DOM 元素', () => {
    const { container } = render(<ReadTimeTracker />);
    expect(container.innerHTML).toBe('');
  });

  it('卸載後不應繼續監聽事件', () => {
    const { unmount } = render(<ReadTimeTracker />);
    unmount();

    jest.advanceTimersByTime(5000);

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    fireEvent(document, new Event('visibilitychange'));

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });
});
