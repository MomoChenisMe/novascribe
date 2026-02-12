/**
 * @file SeoScoreIndicator 元件 RTL 測試
 * @description 測試 SEO 評分指示器元件
 *   - 顏色對應（優良=綠色、尚可=黃色、需改善=紅色）
 *   - 分數顯示
 *   - 各項目明細（通過/未通過）
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { SeoScoreIndicator } from '@/components/seo/SeoScoreIndicator';
import type { SeoScoreItem } from '@/lib/seo/score';

/** 建立測試用的項目明細 */
function createItems(passCount: number): SeoScoreItem[] {
  const names = [
    'Meta Title',
    'Meta Description',
    'Focus Keyword in Title',
    'Focus Keyword in Description',
    'Focus Keyword in Content',
    'OG Image',
    'Content Length',
    'Subheadings',
    'Internal Links',
    'External Links',
  ];

  return names.map((name, i) => ({
    name,
    score: i < passCount ? 10 : 0,
    maxScore: 10,
    description: i < passCount ? `${name} 通過` : `${name} 未通過`,
    passed: i < passCount,
  }));
}

describe('SeoScoreIndicator', () => {
  describe('分數顯示', () => {
    it('應顯示總分', () => {
      render(
        <SeoScoreIndicator
          totalScore={85}
          maxScore={100}
          grade="優良"
          items={createItems(8)}
        />
      );

      expect(screen.getByTestId('score-value')).toHaveTextContent('85');
    });

    it('應顯示分數比例', () => {
      render(
        <SeoScoreIndicator
          totalScore={70}
          maxScore={100}
          grade="尚可"
          items={createItems(7)}
        />
      );

      expect(screen.getByText('SEO 評分：70/100')).toBeInTheDocument();
    });

    it('應顯示評分等級', () => {
      render(
        <SeoScoreIndicator
          totalScore={90}
          maxScore={100}
          grade="優良"
          items={createItems(9)}
        />
      );

      expect(screen.getByTestId('score-grade')).toHaveTextContent('優良');
    });
  });

  describe('等級顏色', () => {
    it('優良應使用綠色', () => {
      render(
        <SeoScoreIndicator
          totalScore={90}
          maxScore={100}
          grade="優良"
          items={createItems(9)}
        />
      );

      const grade = screen.getByTestId('score-grade');
      expect(grade.className).toContain('text-green');
    });

    it('尚可應使用黃色', () => {
      render(
        <SeoScoreIndicator
          totalScore={70}
          maxScore={100}
          grade="尚可"
          items={createItems(7)}
        />
      );

      const grade = screen.getByTestId('score-grade');
      expect(grade.className).toContain('text-yellow');
    });

    it('需改善應使用紅色', () => {
      render(
        <SeoScoreIndicator
          totalScore={30}
          maxScore={100}
          grade="需改善"
          items={createItems(3)}
        />
      );

      const grade = screen.getByTestId('score-grade');
      expect(grade.className).toContain('text-red');
    });
  });

  describe('項目明細', () => {
    it('應顯示所有項目', () => {
      const items = createItems(5);
      render(
        <SeoScoreIndicator
          totalScore={50}
          maxScore={100}
          grade="需改善"
          items={items}
        />
      );

      const list = screen.getByRole('list', { name: 'SEO 檢查項目' });
      const listItems = within(list).getAllByRole('listitem');
      expect(listItems).toHaveLength(10);
    });

    it('通過的項目應顯示 ✓', () => {
      render(
        <SeoScoreIndicator
          totalScore={100}
          maxScore={100}
          grade="優良"
          items={createItems(10)}
        />
      );

      const passedMarkers = screen.getAllByLabelText('通過');
      expect(passedMarkers.length).toBe(10);
    });

    it('未通過的項目應顯示 ✗', () => {
      render(
        <SeoScoreIndicator
          totalScore={0}
          maxScore={100}
          grade="需改善"
          items={createItems(0)}
        />
      );

      const failedMarkers = screen.getAllByLabelText('未通過');
      expect(failedMarkers.length).toBe(10);
    });

    it('應顯示各項目的分數', () => {
      render(
        <SeoScoreIndicator
          totalScore={50}
          maxScore={100}
          grade="需改善"
          items={createItems(5)}
        />
      );

      // 通過的項目應顯示 (10/10)
      expect(screen.getAllByText('(10/10)').length).toBe(5);
      // 未通過的項目應顯示 (0/10)
      expect(screen.getAllByText('(0/10)').length).toBe(5);
    });

    it('應顯示各項目的描述', () => {
      const items = createItems(1);
      render(
        <SeoScoreIndicator
          totalScore={10}
          maxScore={100}
          grade="需改善"
          items={items}
        />
      );

      expect(screen.getByText('Meta Title 通過')).toBeInTheDocument();
      expect(
        screen.getByText('Meta Description 未通過')
      ).toBeInTheDocument();
    });
  });

  describe('無障礙', () => {
    it('應有 aria-label', () => {
      render(
        <SeoScoreIndicator
          totalScore={80}
          maxScore={100}
          grade="優良"
          items={createItems(8)}
        />
      );

      expect(
        screen.getByLabelText('SEO 評分指示器')
      ).toBeInTheDocument();
    });
  });
});
