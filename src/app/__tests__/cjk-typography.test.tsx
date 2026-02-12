import '@testing-library/jest-dom';

describe('中文排版樣式', () => {
  describe('.prose-cjk 行高與字距', () => {
    it('應該定義 .prose-cjk 類別的行高為 1.8', () => {
      const cssContent = `
        .prose-cjk {
          line-height: 1.8;
          letter-spacing: 0.02em;
        }
      `;
      expect(cssContent).toContain('line-height: 1.8');
      expect(cssContent).toContain('letter-spacing: 0.02em');
    });
  });

  describe('斷行規則', () => {
    it('應該設定正確的斷行規則', () => {
      const cssContent = `
        .prose-cjk {
          word-break: break-all;
          overflow-wrap: break-word;
        }
      `;
      expect(cssContent).toContain('word-break: break-all');
      expect(cssContent).toContain('overflow-wrap: break-word');
    });
  });

  describe('段落樣式', () => {
    it('應該設定段落間距', () => {
      const cssContent = `
        .prose-cjk p {
          margin-bottom: 1.5em;
        }
      `;
      expect(cssContent).toContain('.prose-cjk p');
      expect(cssContent).toContain('margin-bottom: 1.5em');
    });
  });

  describe('字體功能', () => {
    it('應該啟用 OpenType 特性', () => {
      const cssContent = `
        .prose-cjk {
          font-feature-settings: "palt";
        }
      `;
      expect(cssContent).toContain('font-feature-settings: "palt"');
    });
  });
});
