/**
 * @file Robots.txt 規則解析函式
 * @description 解析自訂 robots.txt 規則字串，合併預設保護性規則
 *   - 預設保護 /admin 和 /api 路徑
 *   - 保護性路徑不可解除
 *   - 支援多行自訂規則
 */

/** 不可解除的保護性路徑 */
export const PROTECTED_PATHS = ['/admin/', '/api/'] as const;

/** 預設 disallow 規則 */
export const DEFAULT_DISALLOW = [...PROTECTED_PATHS] as const;

export interface RobotsRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
}

/**
 * 解析自訂規則字串為結構化規則
 * 格式：每行一條規則
 *   Allow: /path
 *   Disallow: /path
 *   User-agent: *
 * 空行分隔不同 user-agent 區塊
 */
export function parseCustomRules(rulesText: string): RobotsRule[] {
  if (!rulesText || !rulesText.trim()) {
    return [];
  }

  const lines = rulesText.split('\n').map((line) => line.trim());
  const rules: RobotsRule[] = [];
  let currentRule: RobotsRule | null = null;

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    const [directive, ...valueParts] = line.split(':');
    const key = directive.trim().toLowerCase();
    const value = valueParts.join(':').trim();

    if (key === 'user-agent') {
      if (currentRule) {
        rules.push(currentRule);
      }
      currentRule = { userAgent: value };
    } else if (key === 'allow') {
      if (!currentRule) {
        currentRule = { userAgent: '*' };
      }
      if (!currentRule.allow) currentRule.allow = [];
      currentRule.allow.push(value);
    } else if (key === 'disallow') {
      if (!currentRule) {
        currentRule = { userAgent: '*' };
      }
      if (!currentRule.disallow) currentRule.disallow = [];
      currentRule.disallow.push(value);
    }
  }

  if (currentRule) {
    rules.push(currentRule);
  }

  return rules;
}

/**
 * 合併預設規則和自訂規則
 * 確保保護性路徑不被 allow 覆蓋
 */
export function mergeRules(customRules: RobotsRule[]): RobotsRule[] {
  // 如果沒有自訂規則，回傳預設規則
  if (customRules.length === 0) {
    return [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [...DEFAULT_DISALLOW],
      },
    ];
  }

  // 合併自訂規則，確保保護性路徑始終 disallow
  const merged: RobotsRule[] = [];

  for (const rule of customRules) {
    const mergedRule: RobotsRule = {
      userAgent: rule.userAgent,
      allow: rule.allow
        ? rule.allow.filter(
            (path) => !PROTECTED_PATHS.some((pp) => path.startsWith(pp))
          )
        : undefined,
      disallow: [...DEFAULT_DISALLOW],
    };

    // 加入自訂的 disallow（排除已有的保護性路徑，避免重複）
    if (rule.disallow) {
      for (const path of rule.disallow) {
        if (!mergedRule.disallow!.includes(path)) {
          mergedRule.disallow!.push(path);
        }
      }
    }

    merged.push(mergedRule);
  }

  // 確保至少有一個 * user-agent 規則包含保護性路徑
  const hasWildcard = merged.some((r) => r.userAgent === '*');
  if (!hasWildcard) {
    merged.unshift({
      userAgent: '*',
      allow: ['/'],
      disallow: [...DEFAULT_DISALLOW],
    });
  }

  return merged;
}
