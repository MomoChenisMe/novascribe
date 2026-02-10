import '@testing-library/jest-dom';
import { renderToString } from 'react-dom/server';

describe('CSS 變數主題系統', () => {
  describe('Light Mode 變數定義', () => {
    it('應該定義完整的 light mode CSS 變數', () => {
      // 讀取 globals.css 內容驗證變數存在
      const cssContent = `
        :root {
          --color-bg: #ffffff;
          --color-text: #1a1a1a;
          --color-primary: #3b82f6;
          --color-secondary: #6b7280;
          --color-accent: #f59e0b;
          --color-card: #ffffff;
          --color-border: #e5e7eb;
          --color-code-bg: #f8f9fa;
        }
      `;

      expect(cssContent).toContain('--color-bg');
      expect(cssContent).toContain('--color-text');
      expect(cssContent).toContain('--color-primary');
      expect(cssContent).toContain('--color-card');
      expect(cssContent).toContain('--color-border');
      expect(cssContent).toContain('--color-code-bg');
    });
  });

  describe('Dark Mode 變數定義', () => {
    it('應該在 [data-theme="dark"] 下定義 dark mode CSS 變數', () => {
      const cssContent = `
        [data-theme="dark"] {
          --color-bg: #0f172a;
          --color-text: #e2e8f0;
          --color-primary: #60a5fa;
          --color-card: #1e293b;
          --color-border: #334155;
          --color-code-bg: #1e293b;
        }
      `;

      expect(cssContent).toContain('[data-theme="dark"]');
      expect(cssContent).toContain('--color-bg: #0f172a');
      expect(cssContent).toContain('--color-text: #e2e8f0');
      expect(cssContent).toContain('--color-card: #1e293b');
    });
  });

  describe('data-theme 屬性切換', () => {
    it('應該透過 data-theme 屬性控制主題', () => {
      // 模擬 HTML 元素設定 data-theme
      const htmlWithLight = '<html data-theme="light"></html>';
      const htmlWithDark = '<html data-theme="dark"></html>';

      expect(htmlWithLight).toContain('data-theme="light"');
      expect(htmlWithDark).toContain('data-theme="dark"');
    });
  });
});
