/**
 * @file AnalyticsProvider 元件 RTL 測試
 * @description 測試 GA4 追蹤整合 Provider
 *   - GA4 ID 存在時載入 GoogleAnalytics 元件
 *   - GA4 ID 未設定時不載入
 *   - 後台頁面（/admin 開頭）不追蹤
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
let mockPathname = '/';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock @next/third-parties/google
jest.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="google-analytics" data-ga-id={gaId} />
  ),
}));

import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    mockPathname = '/';
  });

  it('GA4 ID 存在時應載入 GoogleAnalytics', () => {
    render(
      <AnalyticsProvider gaId="G-TEST123">
        <div>Content</div>
      </AnalyticsProvider>
    );

    expect(screen.getByTestId('google-analytics')).toBeInTheDocument();
    expect(screen.getByTestId('google-analytics')).toHaveAttribute(
      'data-ga-id',
      'G-TEST123'
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('GA4 ID 未設定時不應載入 GoogleAnalytics', () => {
    render(
      <AnalyticsProvider gaId={undefined}>
        <div>Content</div>
      </AnalyticsProvider>
    );

    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('GA4 ID 為 null 時不應載入 GoogleAnalytics', () => {
    render(
      <AnalyticsProvider gaId={null}>
        <div>Content</div>
      </AnalyticsProvider>
    );

    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('GA4 ID 為空字串時不應載入 GoogleAnalytics', () => {
    render(
      <AnalyticsProvider gaId="">
        <div>Content</div>
      </AnalyticsProvider>
    );

    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
  });

  it('後台頁面不應追蹤', () => {
    mockPathname = '/admin/dashboard';

    render(
      <AnalyticsProvider gaId="G-TEST123">
        <div>Admin Content</div>
      </AnalyticsProvider>
    );

    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('/admin 路徑不應追蹤', () => {
    mockPathname = '/admin';

    render(
      <AnalyticsProvider gaId="G-TEST123">
        <div>Admin</div>
      </AnalyticsProvider>
    );

    expect(screen.queryByTestId('google-analytics')).not.toBeInTheDocument();
  });

  it('前台頁面應正常追蹤', () => {
    mockPathname = '/posts/hello-world';

    render(
      <AnalyticsProvider gaId="G-TEST123">
        <div>Post Content</div>
      </AnalyticsProvider>
    );

    expect(screen.getByTestId('google-analytics')).toBeInTheDocument();
  });

  it('子元件應正確渲染', () => {
    render(
      <AnalyticsProvider gaId="G-TEST123">
        <h1>Title</h1>
        <p>Paragraph</p>
      </AnalyticsProvider>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });
});
