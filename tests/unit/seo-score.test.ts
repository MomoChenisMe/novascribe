/**
 * @file SEO 評分計算函式單元測試
 * @description 測試 calculateSeoScore 與 getSeoGrade 的各檢查項目、邊界值與等級判定
 *   - 10 項檢查項目權重（每項 10 分）
 *   - 邊界值測試
 *   - 無 SEO 設定時的評分
 *   - 評分等級判定（80-100 優良、60-79 尚可、0-59 需改善）
 */

import {
  calculateSeoScore,
  getSeoGrade,
  type SeoScoreInput,
} from '@/lib/seo/score';

/** 建立完整的 SEO 評分輸入 */
function createFullInput(overrides?: Partial<SeoScoreInput>): SeoScoreInput {
  return {
    metaTitle: 'A'.repeat(60), // 60 字元，在 50-70 範圍內
    metaDescription: 'B'.repeat(130) + ' next.js ', // 140 字元左右，在 120-160 範圍內，且包含 keyword
    focusKeyword: 'next.js',
    ogImage: 'https://example.com/og.jpg',
    title: '學習 Next.js 的完整指南',
    content: `${'C'.repeat(800)}

## 第一章

### 第二章

這是關於 next.js 的文章。

[內部連結](/posts/another-post)

[外部連結](https://example.com)

next.js 很棒。
`,
    ...overrides,
  };
}

/** 建立空的 SEO 評分輸入 */
function createEmptyInput(): SeoScoreInput {
  return {
    metaTitle: null,
    metaDescription: null,
    focusKeyword: null,
    ogImage: null,
    title: '短標題',
    content: '短內容',
  };
}

describe('calculateSeoScore', () => {
  describe('Meta Title 檢查', () => {
    it('50-70 字元應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({ metaTitle: 'A'.repeat(50) })
      );
      const item = result.items.find((i) => i.name === 'Meta Title');
      expect(item?.score).toBe(10);
      expect(item?.passed).toBe(true);
    });

    it('70 字元上限應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({ metaTitle: 'A'.repeat(70) })
      );
      const item = result.items.find((i) => i.name === 'Meta Title');
      expect(item?.score).toBe(10);
    });

    it('49 字元應得 0 分（過短）', () => {
      const result = calculateSeoScore(
        createFullInput({ metaTitle: 'A'.repeat(49) })
      );
      const item = result.items.find((i) => i.name === 'Meta Title');
      expect(item?.score).toBe(0);
      expect(item?.passed).toBe(false);
      expect(item?.description).toContain('過短');
    });

    it('未設定應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({ metaTitle: null })
      );
      const item = result.items.find((i) => i.name === 'Meta Title');
      expect(item?.score).toBe(0);
      expect(item?.description).toContain('未設定');
    });
  });

  describe('Meta Description 檢查', () => {
    it('120-160 字元應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({ metaDescription: 'B'.repeat(120) })
      );
      const item = result.items.find((i) => i.name === 'Meta Description');
      expect(item?.score).toBe(10);
      expect(item?.passed).toBe(true);
    });

    it('160 字元上限應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({ metaDescription: 'B'.repeat(160) })
      );
      const item = result.items.find((i) => i.name === 'Meta Description');
      expect(item?.score).toBe(10);
    });

    it('119 字元應得 0 分（過短）', () => {
      const result = calculateSeoScore(
        createFullInput({ metaDescription: 'B'.repeat(119) })
      );
      const item = result.items.find((i) => i.name === 'Meta Description');
      expect(item?.score).toBe(0);
      expect(item?.description).toContain('過短');
    });

    it('未設定應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({ metaDescription: null })
      );
      const item = result.items.find((i) => i.name === 'Meta Description');
      expect(item?.score).toBe(0);
    });
  });

  describe('Focus Keyword in Title 檢查', () => {
    it('keyword 出現在 title 應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          focusKeyword: 'next.js',
          title: '學習 Next.js 的完整指南',
        })
      );
      const item = result.items.find(
        (i) => i.name === 'Focus Keyword in Title'
      );
      expect(item?.score).toBe(10);
      expect(item?.passed).toBe(true);
    });

    it('keyword 未出現在 title 應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          focusKeyword: 'react',
          title: '學習 Next.js 的完整指南',
        })
      );
      const item = result.items.find(
        (i) => i.name === 'Focus Keyword in Title'
      );
      expect(item?.score).toBe(0);
    });

    it('未設定 keyword 應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({ focusKeyword: null })
      );
      const item = result.items.find(
        (i) => i.name === 'Focus Keyword in Title'
      );
      expect(item?.score).toBe(0);
      expect(item?.description).toContain('未設定');
    });

    it('應忽略大小寫', () => {
      const result = calculateSeoScore(
        createFullInput({
          focusKeyword: 'NEXT.JS',
          title: '學習 next.js 的完整指南',
        })
      );
      const item = result.items.find(
        (i) => i.name === 'Focus Keyword in Title'
      );
      expect(item?.score).toBe(10);
    });
  });

  describe('Focus Keyword in Description 檢查', () => {
    it('keyword 出現在 description 應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          focusKeyword: 'next.js',
          metaDescription:
            '這是一篇關於 Next.js 的文章描述，內容涵蓋了各種技巧和最佳實踐，幫助開發者更好地使用這個強大的框架來建立現代化的網路應用程式和網站，其中包含了豐富的程式碼範例。',
        })
      );
      const item = result.items.find(
        (i) => i.name === 'Focus Keyword in Description'
      );
      expect(item?.score).toBe(10);
    });

    it('keyword 未出現在 description 應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          focusKeyword: 'react',
          metaDescription: 'B'.repeat(140),
        })
      );
      const item = result.items.find(
        (i) => i.name === 'Focus Keyword in Description'
      );
      expect(item?.score).toBe(0);
    });
  });

  describe('Focus Keyword in Content 檢查', () => {
    it('keyword 出現在內文應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          focusKeyword: 'next.js',
          content: `${'C'.repeat(800)}

## 第一章

### 第二章

這是關於 next.js 的文章。

[內部連結](/posts/another-post)

[外部連結](https://example.com)
`,
        })
      );
      const item = result.items.find(
        (i) => i.name === 'Focus Keyword in Content'
      );
      expect(item?.score).toBe(10);
    });

    it('keyword 未出現在內文應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          focusKeyword: 'vue.js',
          content: `${'C'.repeat(800)}

## 第一章

### 第二章

[內部連結](/posts/another-post)

[外部連結](https://example.com)
`,
        })
      );
      const item = result.items.find(
        (i) => i.name === 'Focus Keyword in Content'
      );
      expect(item?.score).toBe(0);
    });
  });

  describe('OG Image 檢查', () => {
    it('有設定 OG image 應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({ ogImage: 'https://example.com/og.jpg' })
      );
      const item = result.items.find((i) => i.name === 'OG Image');
      expect(item?.score).toBe(10);
      expect(item?.passed).toBe(true);
    });

    it('未設定 OG image 應得 0 分', () => {
      const result = calculateSeoScore(createFullInput({ ogImage: null }));
      const item = result.items.find((i) => i.name === 'OG Image');
      expect(item?.score).toBe(0);
    });

    it('空字串應得 0 分', () => {
      const result = calculateSeoScore(createFullInput({ ogImage: '' }));
      const item = result.items.find((i) => i.name === 'OG Image');
      expect(item?.score).toBe(0);
    });
  });

  describe('Content Length 檢查', () => {
    it('≥ 800 字應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({ content: 'C'.repeat(800) })
      );
      const item = result.items.find((i) => i.name === 'Content Length');
      expect(item?.score).toBe(10);
      expect(item?.passed).toBe(true);
    });

    it('799 字應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({ content: 'C'.repeat(799) })
      );
      const item = result.items.find((i) => i.name === 'Content Length');
      expect(item?.score).toBe(0);
      expect(item?.description).toContain('過短');
    });
  });

  describe('Subheadings 檢查', () => {
    it('至少 2 個 H2/H3 應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          content: `${'C'.repeat(800)}\n\n## 標題一\n\n### 標題二\n`,
        })
      );
      const item = result.items.find((i) => i.name === 'Subheadings');
      expect(item?.score).toBe(10);
      expect(item?.passed).toBe(true);
    });

    it('只有 1 個子標題應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          content: `${'C'.repeat(800)}\n\n## 只有一個標題\n`,
        })
      );
      const item = result.items.find((i) => i.name === 'Subheadings');
      expect(item?.score).toBe(0);
    });

    it('無子標題應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({ content: 'C'.repeat(800) })
      );
      const item = result.items.find((i) => i.name === 'Subheadings');
      expect(item?.score).toBe(0);
    });
  });

  describe('Internal Links 檢查', () => {
    it('包含內部連結應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          content: `${'C'.repeat(800)}\n[連結](/posts/test)\n`,
        })
      );
      const item = result.items.find((i) => i.name === 'Internal Links');
      expect(item?.score).toBe(10);
    });

    it('無內部連結應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({ content: 'C'.repeat(800) })
      );
      const item = result.items.find((i) => i.name === 'Internal Links');
      expect(item?.score).toBe(0);
    });
  });

  describe('External Links 檢查', () => {
    it('包含外部連結應得 10 分', () => {
      const result = calculateSeoScore(
        createFullInput({
          content: `${'C'.repeat(800)}\n[外部](https://example.com)\n`,
        })
      );
      const item = result.items.find((i) => i.name === 'External Links');
      expect(item?.score).toBe(10);
    });

    it('無外部連結應得 0 分', () => {
      const result = calculateSeoScore(
        createFullInput({ content: 'C'.repeat(800) })
      );
      const item = result.items.find((i) => i.name === 'External Links');
      expect(item?.score).toBe(0);
    });
  });

  describe('總分計算', () => {
    it('完整設定應得 100 分', () => {
      const result = calculateSeoScore(createFullInput());
      expect(result.totalScore).toBe(100);
      expect(result.maxScore).toBe(100);
      expect(result.grade).toBe('優良');
    });

    it('空設定應得 0 分', () => {
      const result = calculateSeoScore(createEmptyInput());
      expect(result.totalScore).toBe(0);
      expect(result.grade).toBe('需改善');
    });

    it('應回傳 10 個檢查項目', () => {
      const result = calculateSeoScore(createFullInput());
      expect(result.items).toHaveLength(10);
    });
  });
});

describe('getSeoGrade', () => {
  it('80-100 分應為「優良」', () => {
    expect(getSeoGrade(80)).toBe('優良');
    expect(getSeoGrade(90)).toBe('優良');
    expect(getSeoGrade(100)).toBe('優良');
  });

  it('60-79 分應為「尚可」', () => {
    expect(getSeoGrade(60)).toBe('尚可');
    expect(getSeoGrade(70)).toBe('尚可');
    expect(getSeoGrade(79)).toBe('尚可');
  });

  it('0-59 分應為「需改善」', () => {
    expect(getSeoGrade(0)).toBe('需改善');
    expect(getSeoGrade(30)).toBe('需改善');
    expect(getSeoGrade(59)).toBe('需改善');
  });
});
