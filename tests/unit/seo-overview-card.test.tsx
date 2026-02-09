/**
 * @file SeoOverviewCard 元件 RTL 測試
 * @description 測試 SEO 概覽卡片元件
 *   - 統計數字顯示
 *   - 分數類型顯示為 N/100
 *   - 顏色對應（良好=綠色、需注意=黃色、需改善=紅色）
 *   - 描述文字顯示
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SeoOverviewCard } from '@/components/dashboard/SeoOverviewCard';

describe('SeoOverviewCard', () => {
  it('應顯示標籤和數值', () => {
    render(<SeoOverviewCard label="文章總數" value={42} />);

    expect(screen.getByText('文章總數')).toBeInTheDocument();
    expect(screen.getByTestId('card-value')).toHaveTextContent('42');
  });

  it('type=score 時應顯示 N/100 格式', () => {
    render(<SeoOverviewCard label="平均評分" value={85} type="score" />);

    expect(screen.getByTestId('card-value')).toHaveTextContent('85/100');
  });

  it('type=count 時應直接顯示數值', () => {
    render(<SeoOverviewCard label="完善數" value={10} type="count" />);

    expect(screen.getByTestId('card-value')).toHaveTextContent('10');
  });

  it('分數 >= 80 應顯示綠色', () => {
    render(<SeoOverviewCard label="評分" value={85} type="score" />);

    const card = screen.getByTestId('seo-overview-card');
    expect(card.className).toContain('green');
  });

  it('分數 60-79 應顯示黃色', () => {
    render(<SeoOverviewCard label="評分" value={65} type="score" />);

    const card = screen.getByTestId('seo-overview-card');
    expect(card.className).toContain('yellow');
  });

  it('分數 < 60 應顯示紅色', () => {
    render(<SeoOverviewCard label="評分" value={30} type="score" />);

    const card = screen.getByTestId('seo-overview-card');
    expect(card.className).toContain('red');
  });

  it('應顯示描述文字', () => {
    render(
      <SeoOverviewCard
        label="完善數"
        value={5}
        description="評分 ≥ 80 分"
      />
    );

    expect(screen.getByTestId('card-description')).toHaveTextContent(
      '評分 ≥ 80 分'
    );
  });

  it('無描述時不應渲染描述區塊', () => {
    render(<SeoOverviewCard label="數量" value={10} />);

    expect(screen.queryByTestId('card-description')).not.toBeInTheDocument();
  });

  it('字串值應正確顯示', () => {
    render(<SeoOverviewCard label="狀態" value="良好" />);

    expect(screen.getByTestId('card-value')).toHaveTextContent('良好');
  });

  it('分數為 0 應顯示紅色', () => {
    render(<SeoOverviewCard label="評分" value={0} type="score" />);

    const card = screen.getByTestId('seo-overview-card');
    expect(card.className).toContain('red');
    expect(screen.getByTestId('card-value')).toHaveTextContent('0/100');
  });
});
