/**
 * @file TrafficOverviewChart 元件
 * @description 顯示 GA4 流量概覽數據
 *   - 四格統計：瀏覽量、使用者、工作階段、跳出率
 *   - 顯示比較百分比（與前期相比）
 *   - 無數據時顯示提示
 */

'use client';

import React from 'react';

export interface TrafficData {
  pageViews: number;
  users: number;
  sessions: number;
  bounceRate: number;
  pageViewsChange: number;
  usersChange: number;
  sessionsChange: number;
  bounceRateChange: number;
}

interface TrafficOverviewChartProps {
  data?: TrafficData | null;
  configured?: boolean;
  loading?: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function ChangeIndicator({ change }: { change: number }) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const color = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500';
  const prefix = isPositive ? '+' : '';

  return (
    <span className={`text-sm ${color}`} data-testid="change-indicator">
      {prefix}{change}%
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change: number;
}

function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className="rounded-lg border p-4" data-testid="stat-card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold" data-testid="stat-value">{value}</p>
      <ChangeIndicator change={change} />
    </div>
  );
}

export function TrafficOverviewChart({
  data,
  configured = true,
  loading = false,
}: TrafficOverviewChartProps) {
  if (loading) {
    return (
      <div data-testid="traffic-loading" className="text-center py-8">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  if (!configured) {
    return (
      <div data-testid="traffic-not-configured" className="text-center py-8">
        <p className="text-gray-500">尚未設定 GA4，請先在設定頁面填入 GA4 Measurement ID。</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div data-testid="traffic-no-data" className="text-center py-8">
        <p className="text-gray-500">暫無流量數據</p>
      </div>
    );
  }

  return (
    <div data-testid="traffic-overview">
      <h2 className="text-lg font-semibold mb-4">流量概覽</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="瀏覽量"
          value={formatNumber(data.pageViews)}
          change={data.pageViewsChange}
        />
        <StatCard
          label="使用者"
          value={formatNumber(data.users)}
          change={data.usersChange}
        />
        <StatCard
          label="工作階段"
          value={formatNumber(data.sessions)}
          change={data.sessionsChange}
        />
        <StatCard
          label="跳出率"
          value={`${data.bounceRate.toFixed(1)}%`}
          change={data.bounceRateChange}
        />
      </div>
    </div>
  );
}
