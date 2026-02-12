/**
 * @file AnalyticsProvider 元件
 * @description GA4 追蹤整合 Provider
 *   - GA4 ID 存在時載入 Google Analytics script
 *   - 未設定 GA4 ID 時不載入任何追蹤碼
 *   - 後台頁面（/admin）不追蹤
 */

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { GoogleAnalytics } from '@next/third-parties/google';

interface AnalyticsProviderProps {
  gaId?: string | null;
  children: React.ReactNode;
}

export function AnalyticsProvider({ gaId, children }: AnalyticsProviderProps) {
  const pathname = usePathname();

  const isAdminPage = pathname.startsWith('/admin');

  if (!gaId || isAdminPage) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <GoogleAnalytics gaId={gaId} />
    </>
  );
}
