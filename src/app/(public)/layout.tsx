import { ReactNode } from 'react';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { LayoutMinimal } from '@/components/public/layout/LayoutMinimal';

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * 前台公開頁面的 Layout
 * 使用 Swiss Style 極簡設計 (LayoutMinimal)
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <AnalyticsProvider gaId={gaId}>
      <LayoutMinimal>{children}</LayoutMinimal>
    </AnalyticsProvider>
  );
}
