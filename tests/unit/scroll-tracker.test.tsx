/**
 * @file ScrollTracker 元件 RTL 測試
 * @description 測試捲動深度追蹤元件
 *   - 捲動到各深度（25%/50%/75%/100%）觸發事件
 *   - 不重複觸發已到達的深度
 */

import React from 'react';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';

// Mock trackEvent
const mockTrackEvent = jest.fn();
jest.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

import { ScrollTracker } from '@/components/analytics/ScrollTracker';

describe('ScrollTracker', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();

    // Set up document dimensions
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 2000,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 1000,
      configurable: true,
    });
  });

  it('捲動到 25% 時應觸發事件', () => {
    render(<ScrollTracker />);

    Object.defineProperty(window, 'scrollY', { value: 250, configurable: true });
    fireEvent.scroll(window);

    expect(mockTrackEvent).toHaveBeenCalledWith('scroll_depth', {
      percent: 25,
    });
  });

  it('捲動到 50% 時應觸發 25% 和 50% 事件', () => {
    render(<ScrollTracker />);

    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);

    expect(mockTrackEvent).toHaveBeenCalledWith('scroll_depth', { percent: 25 });
    expect(mockTrackEvent).toHaveBeenCalledWith('scroll_depth', { percent: 50 });
  });

  it('捲動到 100% 時應觸發所有深度事件', () => {
    render(<ScrollTracker />);

    Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true });
    fireEvent.scroll(window);

    expect(mockTrackEvent).toHaveBeenCalledWith('scroll_depth', { percent: 25 });
    expect(mockTrackEvent).toHaveBeenCalledWith('scroll_depth', { percent: 50 });
    expect(mockTrackEvent).toHaveBeenCalledWith('scroll_depth', { percent: 75 });
    expect(mockTrackEvent).toHaveBeenCalledWith('scroll_depth', { percent: 100 });
  });

  it('不應重複觸發已到達的深度', () => {
    render(<ScrollTracker />);

    // 第一次捲到 50%
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    fireEvent.scroll(window);

    const callCount = mockTrackEvent.mock.calls.length;

    // 再次捲到 50%
    fireEvent.scroll(window);

    expect(mockTrackEvent.mock.calls.length).toBe(callCount);
  });

  it('頁面高度等於視窗高度時不應觸發', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 1000,
      configurable: true,
    });

    render(<ScrollTracker />);

    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    fireEvent.scroll(window);

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('不應渲染任何 DOM 元素', () => {
    const { container } = render(<ScrollTracker />);
    expect(container.innerHTML).toBe('');
  });
});
