/**
 * @file Sidebar with Stats Server Component
 * @description 取得評論統計資料並傳給 Sidebar
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Sidebar } from './Sidebar';

interface SidebarWithStatsProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * 取得評論統計資料
 */
async function getCommentStats(): Promise<{ pending: number }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { pending: 0 };
    }

    // 使用絕對 URL（在 Server Component 中必須）
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/comments/stats`, {
      cache: 'no-store', // 確保每次都取得最新資料
      headers: {
        // 可以在這裡加入認證 headers 如果需要
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch comment stats:', response.status);
      return { pending: 0 };
    }

    const data = await response.json();
    return { pending: data.pending || 0 };
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    return { pending: 0 };
  }
}

export async function SidebarWithStats({
  collapsed,
  onToggle,
}: SidebarWithStatsProps) {
  const stats = await getCommentStats();

  return (
    <Sidebar
      collapsed={collapsed}
      onToggle={onToggle}
      pendingCount={stats.pending}
    />
  );
}
