/**
 * @file Robots.txt 規則解析單元測試
 * @description 測試 robots.txt 規則解析函式
 *   - 解析自訂規則字串
 *   - 合併預設規則
 *   - 保護性路徑不可解除
 *
 * @jest-environment node
 */

import {
  parseCustomRules,
  mergeRules,
  PROTECTED_PATHS,
  DEFAULT_DISALLOW,
} from '@/lib/seo/robots';

describe('parseCustomRules()', () => {
  it('空字串應回傳空陣列', () => {
    expect(parseCustomRules('')).toEqual([]);
  });

  it('null/undefined 應回傳空陣列', () => {
    expect(parseCustomRules(null as unknown as string)).toEqual([]);
    expect(parseCustomRules(undefined as unknown as string)).toEqual([]);
  });

  it('僅空白應回傳空陣列', () => {
    expect(parseCustomRules('   \n  \n  ')).toEqual([]);
  });

  it('應正確解析 User-agent + Disallow', () => {
    const rules = parseCustomRules(
      'User-agent: Googlebot\nDisallow: /private/'
    );
    expect(rules).toHaveLength(1);
    expect(rules[0].userAgent).toBe('Googlebot');
    expect(rules[0].disallow).toEqual(['/private/']);
  });

  it('應正確解析 User-agent + Allow', () => {
    const rules = parseCustomRules(
      'User-agent: *\nAllow: /public/'
    );
    expect(rules).toHaveLength(1);
    expect(rules[0].userAgent).toBe('*');
    expect(rules[0].allow).toEqual(['/public/']);
  });

  it('應正確解析多個規則區塊', () => {
    const rulesText = [
      'User-agent: Googlebot',
      'Disallow: /tmp/',
      'User-agent: Bingbot',
      'Disallow: /secret/',
      'Allow: /public/',
    ].join('\n');

    const rules = parseCustomRules(rulesText);
    expect(rules).toHaveLength(2);
    expect(rules[0].userAgent).toBe('Googlebot');
    expect(rules[0].disallow).toEqual(['/tmp/']);
    expect(rules[1].userAgent).toBe('Bingbot');
    expect(rules[1].disallow).toEqual(['/secret/']);
    expect(rules[1].allow).toEqual(['/public/']);
  });

  it('無 User-agent 的 directive 應預設 * user-agent', () => {
    const rules = parseCustomRules('Disallow: /test/');
    expect(rules).toHaveLength(1);
    expect(rules[0].userAgent).toBe('*');
    expect(rules[0].disallow).toEqual(['/test/']);
  });

  it('應忽略註解行', () => {
    const rules = parseCustomRules(
      '# This is a comment\nUser-agent: *\nDisallow: /temp/'
    );
    expect(rules).toHaveLength(1);
    expect(rules[0].disallow).toEqual(['/temp/']);
  });
});

describe('mergeRules()', () => {
  it('無自訂規則時應回傳預設規則', () => {
    const merged = mergeRules([]);
    expect(merged).toHaveLength(1);
    expect(merged[0].userAgent).toBe('*');
    expect(merged[0].allow).toEqual(['/']);
    expect(merged[0].disallow).toEqual(expect.arrayContaining([...DEFAULT_DISALLOW]));
  });

  it('應合併自訂 disallow 規則', () => {
    const merged = mergeRules([
      { userAgent: '*', disallow: ['/private/'] },
    ]);
    expect(merged[0].disallow).toContain('/private/');
    expect(merged[0].disallow).toContain('/admin/');
    expect(merged[0].disallow).toContain('/api/');
  });

  it('保護性路徑不可被 allow 覆蓋', () => {
    const merged = mergeRules([
      { userAgent: '*', allow: ['/admin/', '/api/', '/public/'] },
    ]);
    // /admin/ 和 /api/ 應從 allow 中被移除
    expect(merged[0].allow).not.toContain('/admin/');
    expect(merged[0].allow).not.toContain('/api/');
    expect(merged[0].allow).toContain('/public/');
    // 保護性路徑仍在 disallow 中
    expect(merged[0].disallow).toContain('/admin/');
    expect(merged[0].disallow).toContain('/api/');
  });

  it('PROTECTED_PATHS 應包含 /admin/ 和 /api/', () => {
    expect(PROTECTED_PATHS).toContain('/admin/');
    expect(PROTECTED_PATHS).toContain('/api/');
  });

  it('自訂 disallow 不應重複保護性路徑', () => {
    const merged = mergeRules([
      { userAgent: '*', disallow: ['/admin/', '/custom/'] },
    ]);
    const adminCount = merged[0].disallow!.filter(
      (p) => p === '/admin/'
    ).length;
    expect(adminCount).toBe(1);
  });

  it('非 * user-agent 規則時應自動添加 * 規則', () => {
    const merged = mergeRules([
      { userAgent: 'Googlebot', disallow: ['/private/'] },
    ]);
    const wildcardRule = merged.find((r) => r.userAgent === '*');
    expect(wildcardRule).toBeDefined();
    expect(wildcardRule!.disallow).toContain('/admin/');
    expect(wildcardRule!.disallow).toContain('/api/');
  });
});
