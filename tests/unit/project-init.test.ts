import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '../..');

describe('專案初始化驗證', () => {
  describe('Next.js App Router 結構', () => {
    it('src/app/layout.tsx 應存在', () => {
      const layoutPath = path.join(projectRoot, 'src/app/layout.tsx');
      expect(fs.existsSync(layoutPath)).toBe(true);
    });

    it('src/app/page.tsx 應存在', () => {
      const pagePath = path.join(projectRoot, 'src/app/page.tsx');
      expect(fs.existsSync(pagePath)).toBe(true);
    });
  });

  describe('TypeScript 嚴格模式', () => {
    it('tsconfig.json 中 strict 應為 true', () => {
      const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });
  });

  describe('src/ 目錄結構', () => {
    const requiredDirs = ['src/app', 'src/components', 'src/lib', 'src/types'];

    it.each(requiredDirs)('%s 目錄應存在', (dir) => {
      const dirPath = path.join(projectRoot, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });
  });

  describe('套件設定', () => {
    it('package.json 應包含必要的 scripts', () => {
      const pkgPath = path.join(projectRoot, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      expect(pkg.scripts).toHaveProperty('dev');
      expect(pkg.scripts).toHaveProperty('build');
      expect(pkg.scripts).toHaveProperty('start');
      expect(pkg.scripts).toHaveProperty('lint');
      expect(pkg.scripts).toHaveProperty('test');
    });

    it('Next.js 應為 dependencies', () => {
      const pkgPath = path.join(projectRoot, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      expect(pkg.dependencies).toHaveProperty('next');
    });
  });
});
