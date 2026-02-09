/**
 * @file slug 生成函式測試
 * @description 測試 slug 自動生成與去重函式
 *   - 中文轉拼音
 *   - 英文轉換
 *   - 混合內容
 *   - 特殊字元處理
 *   - Emoji 處理
 *   - slug 去重（ensureUniqueSlug）
 */

import { generateSlug, ensureUniqueSlug } from '@/lib/slug';

describe('generateSlug', () => {
  describe('英文標題', () => {
    it('應將英文標題轉為小寫 slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('應將大寫字母轉為小寫', () => {
      expect(generateSlug('MY TITLE HERE')).toBe('my-title-here');
    });

    it('應處理多個空格', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world');
    });

    it('應處理前後空格', () => {
      expect(generateSlug('  Hello World  ')).toBe('hello-world');
    });

    it('應保留數字', () => {
      expect(generateSlug('Top 10 Tips')).toBe('top-10-tips');
    });
  });

  describe('中文標題（轉拼音）', () => {
    it('應將中文轉為拼音 slug', () => {
      expect(generateSlug('你好世界')).toBe('ni-hao-shi-jie');
    });

    it('應處理較長的中文標題', () => {
      const slug = generateSlug('如何學習程式設計');
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug.length).toBeGreaterThan(0);
    });
  });

  describe('混合內容', () => {
    it('應處理中英混合標題', () => {
      const slug = generateSlug('Hello 你好');
      expect(slug).toMatch(/^[a-z0-9-]+$/);
      expect(slug).toContain('hello');
      expect(slug).toContain('ni');
      expect(slug).toContain('hao');
    });

    it('應處理英文加數字', () => {
      expect(generateSlug('Version 2.0 Release')).toBe('version-2-0-release');
    });
  });

  describe('特殊字元處理', () => {
    it('應移除驚嘆號等標點', () => {
      expect(generateSlug('Hello World!')).toBe('hello-world');
    });

    it('應移除問號', () => {
      expect(generateSlug('What is this?')).toBe('what-is-this');
    });

    it('應移除括號', () => {
      expect(generateSlug('React (Library)')).toBe('react-library');
    });

    it('應移除 @ # $ % 等符號', () => {
      expect(generateSlug('user@test #1 $100')).toBe('user-test-1-100');
    });

    it('應移除引號', () => {
      expect(generateSlug("It's a \"test\"")).toBe('it-s-a-test');
    });

    it('應處理連續特殊字元（合併為單一 hyphen）', () => {
      expect(generateSlug('Hello---World')).toBe('hello-world');
    });

    it('應移除開頭和結尾的 hyphen', () => {
      expect(generateSlug('---Hello World---')).toBe('hello-world');
    });

    it('應處理斜線', () => {
      expect(generateSlug('a/b/c')).toBe('a-b-c');
    });
  });

  describe('Emoji 處理', () => {
    it('應移除 emoji', () => {
      expect(generateSlug('Hello 🌍 World')).toBe('hello-world');
    });

    it('應處理只有 emoji 的情況（回傳空字串或最低限度結果）', () => {
      const slug = generateSlug('🎉🎊');
      expect(slug).toMatch(/^[a-z0-9-]*$/);
    });
  });

  describe('邊界情況', () => {
    it('應處理空字串', () => {
      expect(generateSlug('')).toBe('');
    });

    it('應處理只有空格的字串', () => {
      expect(generateSlug('   ')).toBe('');
    });

    it('應處理只有特殊字元的字串', () => {
      expect(generateSlug('!@#$%')).toBe('');
    });

    it('應處理已經是 slug 格式的字串', () => {
      expect(generateSlug('already-a-slug')).toBe('already-a-slug');
    });
  });
});

describe('ensureUniqueSlug', () => {
  it('如果 slug 不存在，應直接回傳原始 slug', async () => {
    const checkExists = jest.fn().mockResolvedValue(false);
    const result = await ensureUniqueSlug('hello-world', checkExists);
    expect(result).toBe('hello-world');
    expect(checkExists).toHaveBeenCalledTimes(1);
    expect(checkExists).toHaveBeenCalledWith('hello-world');
  });

  it('如果 slug 已存在，應加上 -2 後綴', async () => {
    const checkExists = jest.fn()
      .mockResolvedValueOnce(true)   // 'hello-world' exists
      .mockResolvedValueOnce(false); // 'hello-world-2' doesn't exist
    const result = await ensureUniqueSlug('hello-world', checkExists);
    expect(result).toBe('hello-world-2');
    expect(checkExists).toHaveBeenCalledTimes(2);
  });

  it('如果 slug 和 -2 都存在，應加上 -3', async () => {
    const checkExists = jest.fn()
      .mockResolvedValueOnce(true)   // 'test' exists
      .mockResolvedValueOnce(true)   // 'test-2' exists
      .mockResolvedValueOnce(false); // 'test-3' doesn't exist
    const result = await ensureUniqueSlug('test', checkExists);
    expect(result).toBe('test-3');
    expect(checkExists).toHaveBeenCalledTimes(3);
  });

  it('應能處理多次重複', async () => {
    const checkExists = jest.fn()
      .mockResolvedValueOnce(true)   // 'post' exists
      .mockResolvedValueOnce(true)   // 'post-2' exists
      .mockResolvedValueOnce(true)   // 'post-3' exists
      .mockResolvedValueOnce(true)   // 'post-4' exists
      .mockResolvedValueOnce(false); // 'post-5' doesn't exist
    const result = await ensureUniqueSlug('post', checkExists);
    expect(result).toBe('post-5');
    expect(checkExists).toHaveBeenCalledTimes(5);
  });
});
