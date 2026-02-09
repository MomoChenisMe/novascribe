/**
 * @file OutboundLinkTracker 元件 RTL 測試
 * @description 測試外部連結追蹤元件
 *   - 點擊外部連結時觸發事件
 *   - 站內連結不觸發
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock trackEvent
const mockTrackEvent = jest.fn();
jest.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

import { OutboundLinkTracker } from '@/components/analytics/OutboundLinkTracker';

describe('OutboundLinkTracker', () => {
  beforeEach(() => {
    mockTrackEvent.mockClear();
  });

  it('點擊外部連結應觸發 outbound_link 事件', () => {
    render(
      <div>
        <OutboundLinkTracker />
        <a href="https://example.com">External Link</a>
      </div>
    );

    fireEvent.click(screen.getByText('External Link'));

    expect(mockTrackEvent).toHaveBeenCalledWith('outbound_link', {
      url: 'https://example.com/',
      link_text: 'External Link',
    });
  });

  it('點擊站內連結不應觸發事件', () => {
    render(
      <div>
        <OutboundLinkTracker />
        <a href="http://localhost/posts/test">Internal Link</a>
      </div>
    );

    fireEvent.click(screen.getByText('Internal Link'));

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('點擊非連結元素不應觸發事件', () => {
    render(
      <div>
        <OutboundLinkTracker />
        <button>Click Me</button>
      </div>
    );

    fireEvent.click(screen.getByText('Click Me'));

    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  it('點擊巢狀元素應追蹤最近的 anchor', () => {
    render(
      <div>
        <OutboundLinkTracker />
        <a href="https://example.com">
          <span>Nested Text</span>
        </a>
      </div>
    );

    fireEvent.click(screen.getByText('Nested Text'));

    expect(mockTrackEvent).toHaveBeenCalledWith('outbound_link', {
      url: 'https://example.com/',
      link_text: 'Nested Text',
    });
  });

  it('不應渲染任何 DOM 元素', () => {
    const { container } = render(<OutboundLinkTracker />);
    expect(container.innerHTML).toBe('');
  });

  it('卸載後不應繼續追蹤', () => {
    const { unmount } = render(
      <div>
        <OutboundLinkTracker />
        <a href="https://example.com" data-testid="link">Link</a>
      </div>
    );

    unmount();

    // After unmount, event handler should be removed
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });
});
