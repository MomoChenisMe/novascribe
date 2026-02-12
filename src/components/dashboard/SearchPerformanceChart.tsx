/**
 * @file SearchPerformanceChart 元件
 * @description 顯示 Search Console 搜尋效能數據
 *   - 趨勢數據表格（query/page/country/device）
 *   - 期間切換
 *   - 未整合提示
 */

'use client';

import React, { useState } from 'react';

export interface SearchPerformanceRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPerformanceTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPerformanceData {
  rows: SearchPerformanceRow[];
  totals: SearchPerformanceTotals;
}

interface SearchPerformanceChartProps {
  data?: SearchPerformanceData | null;
  configured?: boolean;
  loading?: boolean;
  onPeriodChange?: (days: number) => void;
  onDimensionChange?: (dimension: string) => void;
}

const PERIODS = [
  { label: '7 天', value: 7 },
  { label: '28 天', value: 28 },
  { label: '3 個月', value: 90 },
];

const DIMENSIONS = [
  { label: '搜尋字詞', value: 'query' },
  { label: '頁面', value: 'page' },
  { label: '國家', value: 'country' },
  { label: '裝置', value: 'device' },
];

export function SearchPerformanceChart({
  data,
  configured = true,
  loading = false,
  onPeriodChange,
  onDimensionChange,
}: SearchPerformanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(28);
  const [selectedDimension, setSelectedDimension] = useState('query');

  if (loading) {
    return (
      <div data-testid="search-loading" className="text-center py-8">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  if (!configured) {
    return (
      <div data-testid="search-not-configured" className="text-center py-8">
        <p className="text-gray-500">
          尚未整合 Google Search Console，請先設定 GSC_SITE_URL 環境變數。
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div data-testid="search-no-data" className="text-center py-8">
        <p className="text-gray-500">暫無搜尋數據</p>
      </div>
    );
  }

  const handlePeriodChange = (days: number) => {
    setSelectedPeriod(days);
    onPeriodChange?.(days);
  };

  const handleDimensionChange = (dimension: string) => {
    setSelectedDimension(dimension);
    onDimensionChange?.(dimension);
  };

  return (
    <div data-testid="search-performance">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">搜尋效能</h2>
        <div className="flex gap-2">
          <div className="flex gap-1" data-testid="period-selector">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
                data-testid={`period-${period.value}`}
              >
                {period.label}
              </button>
            ))}
          </div>
          <select
            value={selectedDimension}
            onChange={(e) => handleDimensionChange(e.target.value)}
            className="text-sm border rounded px-2 py-1"
            data-testid="dimension-selector"
          >
            {DIMENSIONS.map((dim) => (
              <option key={dim.value} value={dim.value}>
                {dim.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">點擊</p>
          <p className="text-xl font-bold" data-testid="total-clicks">
            {data.totals.clicks}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">曝光</p>
          <p className="text-xl font-bold" data-testid="total-impressions">
            {data.totals.impressions}
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">CTR</p>
          <p className="text-xl font-bold" data-testid="total-ctr">
            {(data.totals.ctr * 100).toFixed(1)}%
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">平均排名</p>
          <p className="text-xl font-bold" data-testid="total-position">
            {data.totals.position.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Data Table */}
      {data.rows.length > 0 ? (
        <table className="w-full text-sm" data-testid="search-table">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">
                {DIMENSIONS.find((d) => d.value === selectedDimension)?.label}
              </th>
              <th className="text-right py-2">點擊</th>
              <th className="text-right py-2">曝光</th>
              <th className="text-right py-2">CTR</th>
              <th className="text-right py-2">排名</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{row.keys[0]}</td>
                <td className="text-right py-2">{row.clicks}</td>
                <td className="text-right py-2">{row.impressions}</td>
                <td className="text-right py-2">
                  {(row.ctr * 100).toFixed(1)}%
                </td>
                <td className="text-right py-2">{row.position.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500 py-4" data-testid="search-empty-rows">
          此期間無搜尋數據
        </p>
      )}
    </div>
  );
}
