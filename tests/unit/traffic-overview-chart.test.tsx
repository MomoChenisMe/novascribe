/**
 * @file TrafficOverviewChart 元件 RTL 測試
 * @description 測試流量概覽圖表元件
 *   - 數據顯示
 *   - 比較百分比顯示
 *   - 無數據提示
 *   - 未設定提示
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrafficOverviewChart, type TrafficData } from '@/components/dashboard/TrafficOverviewChart';

const mockData: TrafficData = {
  pageViews: 1234,
  users: 567,
  sessions: 789,
  bounceRate: 45.5,
  pageViewsChange: 25,
  usersChange: -10,
  sessionsChange: 0,
  bounceRateChange: -5,
};

describe('TrafficOverviewChart', () => {
  it('應顯示流量數據', () => {
    render(<TrafficOverviewChart data={mockData} />);

    expect(screen.getByText('流量概覽')).toBeInTheDocument();
    expect(screen.getByText('1.2K')).toBeInTheDocument(); // pageViews
    expect(screen.getByText('567')).toBeInTheDocument(); // users
    expect(screen.getByText('789')).toBeInTheDocument(); // sessions
    expect(screen.getByText('45.5%')).toBeInTheDocument(); // bounceRate
  });

  it('應顯示變化百分比', () => {
    render(<TrafficOverviewChart data={mockData} />);

    const indicators = screen.getAllByTestId('change-indicator');
    expect(indicators).toHaveLength(4);
    expect(indicators[0]).toHaveTextContent('+25%');
    expect(indicators[1]).toHaveTextContent('-10%');
    expect(indicators[2]).toHaveTextContent('0%');
    expect(indicators[3]).toHaveTextContent('-5%');
  });

  it('正變化應顯示為綠色', () => {
    render(<TrafficOverviewChart data={mockData} />);

    const indicators = screen.getAllByTestId('change-indicator');
    expect(indicators[0]).toHaveClass('text-green-600');
  });

  it('負變化應顯示為紅色', () => {
    render(<TrafficOverviewChart data={mockData} />);

    const indicators = screen.getAllByTestId('change-indicator');
    expect(indicators[1]).toHaveClass('text-red-600');
  });

  it('無數據時應顯示提示', () => {
    render(<TrafficOverviewChart data={null} />);

    expect(screen.getByTestId('traffic-no-data')).toBeInTheDocument();
    expect(screen.getByText('暫無流量數據')).toBeInTheDocument();
  });

  it('未設定時應顯示設定提示', () => {
    render(<TrafficOverviewChart configured={false} />);

    expect(screen.getByTestId('traffic-not-configured')).toBeInTheDocument();
  });

  it('載入中應顯示載入提示', () => {
    render(<TrafficOverviewChart loading={true} />);

    expect(screen.getByTestId('traffic-loading')).toBeInTheDocument();
    expect(screen.getByText('載入中...')).toBeInTheDocument();
  });

  it('大數字應正確格式化', () => {
    const bigData: TrafficData = {
      ...mockData,
      pageViews: 1500000,
      users: 50000,
    };

    render(<TrafficOverviewChart data={bigData} />);

    expect(screen.getByText('1.5M')).toBeInTheDocument();
    expect(screen.getByText('50.0K')).toBeInTheDocument();
  });

  it('應渲染四個統計卡片', () => {
    render(<TrafficOverviewChart data={mockData} />);

    const cards = screen.getAllByTestId('stat-card');
    expect(cards).toHaveLength(4);
  });
});
