'use client';

/**
 * @file 登出按鈕元件
 * @description 使用 NextAuth.js signOut 進行登出，登出後導向 /login。
 */

import { useState } from 'react';
import { signOut } from 'next-auth/react';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/login' });
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? '登出中...' : '登出'}
    </button>
  );
}
