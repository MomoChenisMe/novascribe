'use client';

/**
 * @file SEO 評分指示器元件
 * @description 顯示 SEO 評分結果，包含：
 *   - 總分與等級（顏色對應）
 *   - 各項目檢查明細
 *   - 通過/未通過圖示
 *
 * 等級顏色：
 *   - 優良（80-100）：綠色
 *   - 尚可（60-79）：黃色
 *   - 需改善（0-59）：紅色
 */

import type { SeoScoreItem, SeoGrade } from '@/lib/seo/score';

/** SeoScoreIndicator 元件 props */
export interface SeoScoreIndicatorProps {
  /** 總分 */
  totalScore: number;
  /** 最高分 */
  maxScore: number;
  /** 評分等級 */
  grade: SeoGrade;
  /** 各項目明細 */
  items: SeoScoreItem[];
}

/** 等級對應的顏色樣式 */
function getGradeColor(grade: SeoGrade): {
  text: string;
  bg: string;
  ring: string;
} {
  switch (grade) {
    case '優良':
      return {
        text: 'text-green-700',
        bg: 'bg-green-100',
        ring: 'ring-green-500',
      };
    case '尚可':
      return {
        text: 'text-yellow-700',
        bg: 'bg-yellow-100',
        ring: 'ring-yellow-500',
      };
    case '需改善':
      return {
        text: 'text-red-700',
        bg: 'bg-red-100',
        ring: 'ring-red-500',
      };
  }
}

export function SeoScoreIndicator({
  totalScore,
  maxScore,
  grade,
  items,
}: SeoScoreIndicatorProps) {
  const colors = getGradeColor(grade);

  return (
    <div aria-label="SEO 評分指示器" className="rounded-lg border border-gray-200 bg-white p-4">
      {/* 總分顯示 */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full ring-4 ${colors.bg} ${colors.ring}`}
          data-testid="score-circle"
        >
          <span className={`text-xl font-bold ${colors.text}`} data-testid="score-value">
            {totalScore}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            SEO 評分：{totalScore}/{maxScore}
          </p>
          <p className={`text-lg font-semibold ${colors.text}`} data-testid="score-grade">
            {grade}
          </p>
        </div>
      </div>

      {/* 各項目明細 */}
      <ul className="space-y-2" aria-label="SEO 檢查項目">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-start gap-2 text-sm"
          >
            <span
              className={`mt-0.5 flex-shrink-0 ${item.passed ? 'text-green-500' : 'text-red-500'}`}
              aria-label={item.passed ? '通過' : '未通過'}
            >
              {item.passed ? '✓' : '✗'}
            </span>
            <div>
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-400"> ({item.score}/{item.maxScore})</span>
              <p className="text-gray-500">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
