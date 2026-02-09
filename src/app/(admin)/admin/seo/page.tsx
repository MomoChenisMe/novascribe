/**
 * @file SEO 儀表板頁面
 * @description /admin/seo — 顯示 SEO 概覽數據、缺少 SEO 清單、改善建議
 */

'use client';

import React, { useEffect, useState } from 'react';
import { SeoOverviewCard } from '@/components/dashboard/SeoOverviewCard';
import { MissingSeoList, type MissingSeoPost } from '@/components/dashboard/MissingSeoList';
import type { SeoSuggestion } from '@/lib/seo/suggestions';

interface DashboardData {
  overview: {
    totalPosts: number;
    averageScore: number;
    completeSeoCount: number;
    missingMetaCount: number;
  };
  missingMetaPosts: MissingSeoPost[];
  suggestions: SeoSuggestion[];
}

export default function SeoPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/seo/dashboard');
        const json = await res.json();

        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || '無法載入數據');
        }
      } catch {
        setError('無法連線到伺服器');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SEO 儀表板</h1>
        <a
          href="/admin/seo/settings"
          className="text-sm text-blue-600 hover:underline"
        >
          全站 SEO 設定
        </a>
      </div>

      {/* 概覽卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SeoOverviewCard
          label="平均 SEO 評分"
          value={data.overview.averageScore}
          type="score"
        />
        <SeoOverviewCard
          label="文章總數"
          value={data.overview.totalPosts}
          type="count"
        />
        <SeoOverviewCard
          label="SEO 完善"
          value={data.overview.completeSeoCount}
          type="count"
          description="評分 ≥ 80 分"
        />
        <SeoOverviewCard
          label="缺少 Meta"
          value={data.overview.missingMetaCount}
          type="count"
          description="缺少 title 或 description"
        />
      </div>

      {/* 缺少 SEO 清單 */}
      <MissingSeoList posts={data.missingMetaPosts} />

      {/* 改善建議 */}
      {data.suggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">改善建議</h3>
          <ul className="space-y-2">
            {data.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={`p-3 rounded-lg border text-sm ${
                  suggestion.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : suggestion.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}
                data-testid="suggestion-item"
              >
                <span className="font-medium">{suggestion.postTitle}</span>
                {' — '}
                {suggestion.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
