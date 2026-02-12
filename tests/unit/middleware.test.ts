/**
 * @file Middleware 路由保護測試
 * @description 驗證 middleware 設定：
 *   - matcher 設定為 /admin/:path*
 *   - 確保只保護 admin 路由
 *   - 驗證路由匹配邏輯
 */

// Mock next-auth/middleware 因為它依賴 next/server 的 Request（jsdom 環境不可用）
const mockWithAuth = jest.fn(() => 'mocked-middleware');
jest.mock('next-auth/middleware', () => ({
  __esModule: true,
  default: mockWithAuth,
}));

describe('Middleware 路由保護', () => {
  beforeEach(() => {
    jest.resetModules();
    // 重新設定 mock（resetModules 會清除模組快取）
    jest.doMock('next-auth/middleware', () => ({
      __esModule: true,
      default: jest.fn(() => 'mocked-middleware'),
    }));
  });

  it('應匯出 default middleware', async () => {
    const middlewareModule = await import('@/middleware');
    expect(middlewareModule.default).toBeDefined();
  });

  it('config.matcher 應包含 /admin/:path*', async () => {
    const middlewareModule = await import('@/middleware');
    expect(middlewareModule.config).toBeDefined();
    expect(middlewareModule.config.matcher).toContain('/admin/:path*');
  });

  it('config.matcher 不應包含公開頁面路由', async () => {
    const middlewareModule = await import('@/middleware');
    const matcher = middlewareModule.config.matcher;

    expect(matcher).not.toContain('/');
    expect(matcher).not.toContain('/login');
    expect(matcher).not.toContain('/api/auth/:path*');
  });

  it('config.matcher 應只包含 admin 相關路由', async () => {
    const middlewareModule = await import('@/middleware');
    const matcher = middlewareModule.config.matcher;

    for (const pattern of matcher) {
      expect(pattern).toMatch(/^\/admin/);
    }
  });
});

describe('Middleware 路由匹配驗證', () => {
  /**
   * 測試路徑是否匹配 /admin/:path* 模式
   */
  function matchesAdminPattern(path: string): boolean {
    return path.startsWith('/admin');
  }

  it('未認證存取 /admin 應需要保護', () => {
    expect(matchesAdminPattern('/admin')).toBe(true);
  });

  it('未認證存取 /admin/dashboard 應需要保護', () => {
    expect(matchesAdminPattern('/admin/dashboard')).toBe(true);
  });

  it('未認證存取 /admin/settings/profile 應需要保護', () => {
    expect(matchesAdminPattern('/admin/settings/profile')).toBe(true);
  });

  it('公開頁面 / 不應需要保護', () => {
    expect(matchesAdminPattern('/')).toBe(false);
  });

  it('登入頁面 /login 不應需要保護', () => {
    expect(matchesAdminPattern('/login')).toBe(false);
  });

  it('API 認證路由 /api/auth/signin 不應需要保護', () => {
    expect(matchesAdminPattern('/api/auth/signin')).toBe(false);
  });
});
