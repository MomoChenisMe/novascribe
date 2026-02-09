'use client';

/**
 * @file 後台佈局元件
 * @description 後台管理三區域佈局：頂部列、側邊欄、主內容區。
 *   - 桌面（lg+, ≥1024px）：固定側邊欄
 *   - 平板（md, 768-1023px）：收合的側邊欄（只顯示 icon）
 *   - 手機（< 768px）：漢堡選單觸發抽屜式側邊欄
 */

import { useState } from 'react';
import { Header } from '@/components/admin/Header';
import { Sidebar } from '@/components/admin/Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleToggle() {
    setCollapsed((prev) => !prev);
  }

  function handleMenuClick() {
    setMobileOpen(true);
  }

  function handleMobileClose() {
    setMobileOpen(false);
  }

  return (
    <div className="flex h-screen flex-col">
      {/* 頂部列 */}
      <Header onMenuClick={handleMenuClick} />

      <div className="flex flex-1 overflow-hidden">
        {/* 桌面/平板側邊欄 */}
        <aside className="hidden md:block" data-testid="sidebar-desktop">
          <Sidebar collapsed={collapsed} onToggle={handleToggle} />
        </aside>

        {/* 手機版側邊欄 overlay */}
        {mobileOpen && (
          <>
            {/* 背景遮罩 */}
            <div
              data-testid="mobile-sidebar-overlay"
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={handleMobileClose}
              aria-hidden="true"
            />
            {/* 抽屜式側邊欄 */}
            <aside className="fixed inset-y-0 left-0 z-50 md:hidden">
              <Sidebar collapsed={false} onToggle={handleMobileClose} />
            </aside>
          </>
        )}

        {/* 主內容區 */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
