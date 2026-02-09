'use client';

/**
 * @file 後台首頁
 * @description 後台管理首頁，顯示歡迎訊息和系統資訊。
 *   - 歡迎訊息：「歡迎回來，{使用者名稱}」
 *   - 系統資訊：Next.js 版本、Node.js 版本、React 版本
 *   - 簡單的卡片佈局
 */

import { useSession } from 'next-auth/react';
import { version as reactVersion } from 'react';

/** 系統資訊項目 */
interface SystemInfo {
  label: string;
  value: string;
}

/** 取得系統資訊 */
function getSystemInfo(): SystemInfo[] {
  return [
    { label: 'Next.js', value: '16.1.6' },
    { label: 'React', value: reactVersion },
    { label: 'Node.js', value: typeof process !== 'undefined' ? process.version : 'N/A' },
    { label: 'TypeScript', value: '5.x' },
  ];
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  const displayName =
    session?.user?.name || session?.user?.email || '使用者';

  const systemInfo = getSystemInfo();

  return (
    <div className="space-y-6">
      {/* 歡迎訊息 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          歡迎回來，{displayName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          NovaScribe 管理後台
        </p>
      </div>

      {/* 系統資訊卡片 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          系統資訊
        </h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {systemInfo.map((info) => (
            <div
              key={info.label}
              className="rounded-lg bg-gray-50 px-4 py-3"
            >
              <dt className="text-sm font-medium text-gray-500">
                {info.label}
              </dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">
                {info.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
