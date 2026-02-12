/**
 * @file Robots.txt 動態生成整合測試
 * @description 測試 src/app/robots.ts 的動態 robots.txt 生成
 *   - 預設規則（Disallow: /admin, /api）
 *   - 自訂規則（從 site_settings 讀取）
 *   - Sitemap URL 自動包含
 *   - 保護性路徑不可解除
 *
 * @jest-environment node
 */

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    siteSetting: {
      findUnique: jest.fn(),
    },
  },
}));

import robots from '@/app/robots';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('robots()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://blog.example.com';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('應包含預設 disallow 規則（/admin/、/api/）', async () => {
    (mockPrisma.siteSetting.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await robots();

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === '*');
    expect(wildcardRule).toBeDefined();
    expect(wildcardRule!.disallow).toContain('/admin/');
    expect(wildcardRule!.disallow).toContain('/api/');
  });

  it('應包含預設 allow 規則（/）', async () => {
    (mockPrisma.siteSetting.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await robots();

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === '*');
    expect(wildcardRule!.allow).toContain('/');
  });

  it('應包含 Sitemap URL', async () => {
    (mockPrisma.siteSetting.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await robots();

    expect(result.sitemap).toBe('https://blog.example.com/sitemap.xml');
  });

  it('有自訂規則時應合併到結果中', async () => {
    (mockPrisma.siteSetting.findUnique as jest.Mock).mockResolvedValue({
      key: 'seo.robots_custom_rules',
      value: 'User-agent: Googlebot\nDisallow: /private/',
    });

    const result = await robots();

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    // 應有 Googlebot 規則
    const googlebotRule = rules.find((r) => r.userAgent === 'Googlebot');
    expect(googlebotRule).toBeDefined();
    expect(googlebotRule!.disallow).toContain('/private/');
    // Googlebot 規則也應包含保護性路徑
    expect(googlebotRule!.disallow).toContain('/admin/');
    expect(googlebotRule!.disallow).toContain('/api/');
  });

  it('自訂規則不可解除保護性路徑', async () => {
    (mockPrisma.siteSetting.findUnique as jest.Mock).mockResolvedValue({
      key: 'seo.robots_custom_rules',
      value: 'User-agent: *\nAllow: /admin/\nAllow: /api/',
    });

    const result = await robots();

    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const wildcardRule = rules.find((r) => r.userAgent === '*');
    expect(wildcardRule!.disallow).toContain('/admin/');
    expect(wildcardRule!.disallow).toContain('/api/');
    // /admin/ 和 /api/ 不應出現在 allow 中
    if (wildcardRule!.allow) {
      const allowList = Array.isArray(wildcardRule!.allow)
        ? wildcardRule!.allow
        : [wildcardRule!.allow];
      expect(allowList).not.toContain('/admin/');
      expect(allowList).not.toContain('/api/');
    }
  });

  it('無 NEXT_PUBLIC_SITE_URL 時使用預設值', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    (mockPrisma.siteSetting.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await robots();

    expect(result.sitemap).toBe('https://example.com/sitemap.xml');
  });
});
