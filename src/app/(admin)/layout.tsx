'use client';

/**
 * @file 後台 Route Group Layout
 * @description 為整個 (admin) route group 提供 SessionProvider 包裹。
 *   - 包裹 /login 和 /admin/* 所有路由
 *   - 使所有後台頁面都能使用 NextAuth.js hooks (useSession 等)
 */

import { SessionProvider } from 'next-auth/react';

interface AdminGroupLayoutProps {
  children: React.ReactNode;
}

export default function AdminGroupLayout({ children }: AdminGroupLayoutProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
