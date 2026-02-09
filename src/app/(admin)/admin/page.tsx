'use client';

/**
 * @file 後台儀表板頁面
 * @description 後台管理首頁，顯示統計數據、快速操作與近期活動
 *   - 統計卡片：文章、分類、標籤、媒體的數量統計
 *   - 快速操作捷徑：新增文章、管理分類、管理標籤、媒體庫
 *   - 近期活動時間線：最近 7 天的操作記錄
 *   - 響應式設計（桌面 3 欄、平板 2 欄、手機 1 欄）
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

/** 統計數據 */
interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalCategories: number;
  totalTags: number;
  totalMedia: number;
  recentPostsCount: number;
}

/** 近期活動 */
interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

/** 統計卡片設定 */
interface StatCard {
  label: string;
  key: keyof DashboardStats;
  icon: string;
  color: string;
}

const statCards: StatCard[] = [
  { label: '文章總數', key: 'totalPosts', icon: '📝', color: 'bg-blue-50 text-blue-700' },
  { label: '已發佈', key: 'publishedPosts', icon: '✅', color: 'bg-green-50 text-green-700' },
  { label: '草稿', key: 'draftPosts', icon: '📋', color: 'bg-yellow-50 text-yellow-700' },
  { label: '分類', key: 'totalCategories', icon: '📂', color: 'bg-purple-50 text-purple-700' },
  { label: '標籤', key: 'totalTags', icon: '🏷️', color: 'bg-indigo-50 text-indigo-700' },
  { label: '媒體', key: 'totalMedia', icon: '🖼️', color: 'bg-pink-50 text-pink-700' },
];

/** 快速操作 */
const quickActions = [
  { label: '新增文章', href: '/admin/posts/new', icon: '✏️' },
  { label: '管理分類', href: '/admin/categories', icon: '📂' },
  { label: '管理標籤', href: '/admin/tags', icon: '🏷️' },
  { label: '媒體庫', href: '/admin/media', icon: '🖼️' },
];

/** 活動類型 icon 對照 */
const activityIcons: Record<string, string> = {
  post_created: '📝',
  post_updated: '✏️',
  post_published: '✅',
  category_created: '📂',
  tag_created: '🏷️',
  media_uploaded: '🖼️',
};

/** 格式化時間 */
function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '剛剛';
  if (diffMin < 60) return `${diffMin} 分鐘前`;
  if (diffHr < 24) return `${diffHr} 小時前`;
  if (diffDay < 7) return `${diffDay} 天前`;

  return date.toLocaleDateString('zh-TW');
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats'),
          fetch('/api/admin/dashboard/activity?limit=10'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData.data);
          }
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          if (activityData.success) {
            setActivities(activityData.data);
          }
        }
      } catch {
        // 靜默處理錯誤，UI 會顯示預設狀態
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
        <p className="mt-1 text-sm text-gray-500">
          NovaScribe 管理後台總覽
        </p>
      </div>

      {/* 統計卡片 */}
      <section>
        <h2 className="sr-only">統計數據</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.key}
              className={`rounded-lg border border-gray-200 p-5 shadow-sm ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">
                    {card.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {stats?.[card.key] ?? 0}
                  </p>
                </div>
                <span className="text-3xl" role="img" aria-hidden="true">
                  {card.icon}
                </span>
              </div>
            </div>
          ))}
          {/* 近 7 天新增文章 */}
          <div className="rounded-lg border border-gray-200 bg-orange-50 p-5 text-orange-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">
                  近 7 天新增
                </p>
                <p className="mt-1 text-3xl font-bold">
                  {stats?.recentPostsCount ?? 0}
                </p>
              </div>
              <span className="text-3xl" role="img" aria-hidden="true">
                📊
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 快速操作 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          快速操作
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
            >
              <span className="text-xl" role="img" aria-hidden="true">
                {action.icon}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 近期活動 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          近期活動
        </h2>
        {activities && activities.length > 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <ul className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <li key={activity.id} className="flex items-start gap-3 p-4">
                  <span
                    className="mt-0.5 text-lg"
                    role="img"
                    aria-hidden="true"
                  >
                    {activityIcons[activity.type] || '📌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">暫無近期活動</p>
          </div>
        )}
      </section>
    </div>
  );
}
