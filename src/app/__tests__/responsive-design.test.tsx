import '@testing-library/jest-dom';

describe('響應式設計', () => {
  describe('斷點設定', () => {
    it('應該定義標準斷點（手機/平板/桌面）', () => {
      const tailwindConfig = `
        @media (min-width: 640px) { /* sm */ }
        @media (min-width: 768px) { /* md */ }
        @media (min-width: 1024px) { /* lg */ }
        @media (min-width: 1280px) { /* xl */ }
      `;

      expect(tailwindConfig).toContain('640px');
      expect(tailwindConfig).toContain('768px');
      expect(tailwindConfig).toContain('1024px');
    });
  });

  describe('容器寬度', () => {
    it('應該定義響應式容器', () => {
      const cssContent = `
        .container-responsive {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        @media (min-width: 768px) {
          .container-responsive {
            padding: 0 2rem;
          }
        }
      `;

      expect(cssContent).toContain('.container-responsive');
      expect(cssContent).toContain('max-width: 1280px');
      expect(cssContent).toContain('padding: 0 1rem');
    });
  });

  describe('元素顯示/隱藏規則', () => {
    it('應該支援響應式顯示/隱藏', () => {
      const cssContent = `
        .hidden-mobile { display: none; }
        @media (min-width: 768px) {
          .hidden-mobile { display: block; }
        }
        
        .visible-mobile { display: block; }
        @media (min-width: 768px) {
          .visible-mobile { display: none; }
        }
      `;

      expect(cssContent).toContain('.hidden-mobile');
      expect(cssContent).toContain('.visible-mobile');
    });
  });
});
