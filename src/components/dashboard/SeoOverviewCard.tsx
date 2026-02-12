/**
 * @file SeoOverviewCard 元件
 * @description 顯示 SEO 概覽統計數字
 *   - 統計數字顯示
 *   - 顏色對應（良好=綠色、需注意=黃色、需改善=紅色）
 */

import React from 'react';

interface SeoOverviewCardProps {
  label: string;
  value: number | string;
  type?: 'score' | 'count' | 'default';
  description?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

export function SeoOverviewCard({
  label,
  value,
  type = 'default',
  description,
}: SeoOverviewCardProps) {
  let colorClass = 'text-gray-900 bg-white border-gray-200';

  if (type === 'score' && typeof value === 'number') {
    colorClass = getScoreColor(value);
  }

  return (
    <div
      className={`rounded-lg border p-4 ${colorClass}`}
      data-testid="seo-overview-card"
    >
      <p className="text-sm opacity-75">{label}</p>
      <p className="text-2xl font-bold" data-testid="card-value">
        {type === 'score' ? `${value}/100` : value}
      </p>
      {description && (
        <p className="text-xs mt-1 opacity-60" data-testid="card-description">
          {description}
        </p>
      )}
    </div>
  );
}
