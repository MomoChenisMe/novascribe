/**
 * @file 流量分析儀表板頁面
 * @description /admin/analytics — 顯示 GA4 流量數據概覽
 */

'use client';

import React, { useEffect, useState } from 'react';
import { TrafficOverviewChart, type TrafficData } from '@/components/dashboard/TrafficOverviewChart';

interface OverviewResponse {
  success: boolean;
  data?: TrafficData;
  configured?: boolean;
  error?: string;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/analytics/overview');
        const json: OverviewResponse = await res.json();

        if (json.configured === false) {
          setConfigured(false);
        } else if (json.success && json.data) {
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">流量分析</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <TrafficOverviewChart
        data={data}
        configured={configured}
        loading={loading}
      />
    </div>
  );
}
