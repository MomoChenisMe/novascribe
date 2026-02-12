import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '../..');

describe('Tailwind CSS 整合驗證', () => {
  describe('設定檔存在且正確', () => {
    it('postcss.config.mjs 應存在且包含 @tailwindcss/postcss', () => {
      const configPath = path.join(projectRoot, 'postcss.config.mjs');
      expect(fs.existsSync(configPath)).toBe(true);
      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('@tailwindcss/postcss');
    });

    it('globals.css 應匯入 tailwindcss', () => {
      const cssPath = path.join(projectRoot, 'src/app/globals.css');
      expect(fs.existsSync(cssPath)).toBe(true);
      const content = fs.readFileSync(cssPath, 'utf-8');
      expect(content).toMatch(/@import\s+['"]tailwindcss['"]/);
    });

    it('tailwindcss 應為 devDependencies', () => {
      const pkgPath = path.join(projectRoot, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      expect(pkg.devDependencies).toHaveProperty('tailwindcss');
    });
  });

  describe('自訂設計 token', () => {
    let cssContent: string;

    beforeAll(() => {
      const cssPath = path.join(projectRoot, 'src/app/globals.css');
      cssContent = fs.readFileSync(cssPath, 'utf-8');
    });

    it('應定義 primary 色彩', () => {
      expect(cssContent).toContain('--primary');
    });

    it('應定義 secondary 色彩', () => {
      expect(cssContent).toContain('--secondary');
    });

    it('應定義 accent 色彩', () => {
      expect(cssContent).toContain('--accent');
    });

    it('應定義 success / warning / error 狀態色', () => {
      expect(cssContent).toContain('--success');
      expect(cssContent).toContain('--warning');
      expect(cssContent).toContain('--error');
    });

    it('應包含 @theme 區塊定義 Tailwind 色彩 token', () => {
      expect(cssContent).toContain('@theme');
      expect(cssContent).toContain('--color-primary');
      expect(cssContent).toContain('--color-secondary');
    });

    it('應定義深色模式色彩', () => {
      expect(cssContent).toContain('prefers-color-scheme: dark');
    });

    it('應定義字型 token', () => {
      expect(cssContent).toContain('--font-sans');
      expect(cssContent).toContain('--font-mono');
    });
  });
});
