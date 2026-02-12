'use client';

/**
 * @file 頂部列元件
 * @description 後台管理頂部列，顯示使用者資訊、登出按鈕及漢堡選單。
 *   - 顯示使用者名稱/email（使用 useSession()）
 *   - 包含 LogoutButton 元件
 *   - 手機模式下顯示漢堡選單按鈕
 */

import { useSession } from 'next-auth/react';
import { LogoutButton } from '@/components/admin/LogoutButton';

/** Header 元件 props */
interface HeaderProps {
  /** 漢堡選單點擊事件 */
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session, status } = useSession();

  const displayName =
    session?.user?.name || session?.user?.email || '';

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm">
      {/* 左側：漢堡選單 + 應用名稱 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="開啟選單"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <span aria-hidden="true" className="text-xl">
            ☰
          </span>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">NovaScribe</h1>
      </div>

      {/* 右側：使用者資訊 + 登出 */}
      {status === 'authenticated' && (
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-600 sm:block">
            {displayName}
          </span>
          <LogoutButton />
        </div>
      )}
    </header>
  );
}
