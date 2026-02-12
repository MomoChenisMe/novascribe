/**
 * @file SearchPerformanceChart 元件 RTL 測試
 * @description 測試搜尋效能圖表元件
 *   - 趨勢圖渲染
 *   - 期間切換
 *   - 維度切換
 *   - 未整合提示
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchPerformanceChart, type SearchPerformanceData } from '@/components/dashboard/SearchPerformanceChart';

const mockData: SearchPerformanceData = {
  rows: [
    { keys: ['nextjs tutorial'], clicks: 100, impressions: 1000, ctr: 0.1, position: 3.5 },
    { keys: ['react blog'], clicks: 50, impressions: 500, ctr: 0.1, position: 8.2 },
  ],
  totals: {
    clicks: 150,
    impressions: 1500,
    ctr: 0.1,
    position: 5.85,
  },
};

describe('SearchPerformanceChart', () => {
  it('應顯示搜尋效能數據', () => {
    render(<SearchPerformanceChart data={mockData} />);

    expect(screen.getByText('搜尋效能')).toBeInTheDocument();
    expect(screen.getByTestId('total-clicks')).toHaveTextContent('150');
    expect(screen.getByTestId('total-impressions')).toHaveTextContent('1500');
    expect(screen.getByTestId('total-ctr')).toHaveTextContent('10.0%');
    expect(screen.getByTestId('total-position')).toHaveTextContent('5.8');
  });

  it('應顯示數據表格', () => {
    render(<SearchPerformanceChart data={mockData} />);

    expect(screen.getByTestId('search-table')).toBeInTheDocument();
    expect(screen.getByText('nextjs tutorial')).toBeInTheDocument();
    expect(screen.getByText('react blog')).toBeInTheDocument();
  });

  it('期間切換應呼叫 onPeriodChange', () => {
    const onPeriodChange = jest.fn();
    render(
      <SearchPerformanceChart data={mockData} onPeriodChange={onPeriodChange} />
    );

    fireEvent.click(screen.getByTestId('period-7'));

    expect(onPeriodChange).toHaveBeenCalledWith(7);
  });

  it('維度切換應呼叫 onDimensionChange', () => {
    const onDimensionChange = jest.fn();
    render(
      <SearchPerformanceChart data={mockData} onDimensionChange={onDimensionChange} />
    );

    fireEvent.change(screen.getByTestId('dimension-selector'), {
      target: { value: 'page' },
    });

    expect(onDimensionChange).toHaveBeenCalledWith('page');
  });

  it('未設定時應顯示整合提示', () => {
    render(<SearchPerformanceChart configured={false} />);

    expect(screen.getByTestId('search-not-configured')).toBeInTheDocument();
  });

  it('載入中應顯示載入提示', () => {
    render(<SearchPerformanceChart loading={true} />);

    expect(screen.getByTestId('search-loading')).toBeInTheDocument();
  });

  it('無數據時應顯示提示', () => {
    render(<SearchPerformanceChart data={null} />);

    expect(screen.getByTestId('search-no-data')).toBeInTheDocument();
  });

  it('空列時應顯示無數據訊息', () => {
    const emptyData: SearchPerformanceData = {
      rows: [],
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    };

    render(<SearchPerformanceChart data={emptyData} />);

    expect(screen.getByTestId('search-empty-rows')).toBeInTheDocument();
  });

  it('應顯示期間選擇器', () => {
    render(<SearchPerformanceChart data={mockData} />);

    expect(screen.getByTestId('period-selector')).toBeInTheDocument();
    expect(screen.getByText('7 天')).toBeInTheDocument();
    expect(screen.getByText('28 天')).toBeInTheDocument();
    expect(screen.getByText('3 個月')).toBeInTheDocument();
  });
});
