import { ReactNode } from 'react';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * 前台公開頁面的 Layout
 * 包含 Header、Footer、Analytics 等共用元件
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <AnalyticsProvider gaId={gaId}>
      <div className="min-h-screen flex flex-col">
        {/* Header 稍後實作 */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">NovaScribe</h1>
          </div>
        </header>

        {/* 主內容區域 */}
        <main className="flex-1">{children}</main>

        {/* Footer 稍後實作 */}
        <footer className="border-t mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} NovaScribe. All rights reserved.
          </div>
        </footer>
      </div>
    </AnalyticsProvider>
  );
}
