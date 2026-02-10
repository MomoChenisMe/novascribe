/**
 * @file Anti-spam 功能測試
 * @description 測試垃圾訊息防禦機制
 */

import { checkHoneypot, filterContent, checkAntiSpam } from '../anti-spam';

describe('checkHoneypot', () => {
  it('應該通過空白 honeypot', () => {
    const result = checkHoneypot('');
    expect(result.pass).toBe(true);
  });

  it('應該通過 null honeypot', () => {
    const result = checkHoneypot(null);
    expect(result.pass).toBe(true);
  });

  it('應該通過 undefined honeypot', () => {
    const result = checkHoneypot(undefined);
    expect(result.pass).toBe(true);
  });

  it('應該阻擋有內容的 honeypot', () => {
    const result = checkHoneypot('bot-filled-value');
    expect(result.pass).toBe(false);
    expect(result.reason).toBe('honeypot');
  });
});

describe('filterContent', () => {
  describe('禁止詞偵測', () => {
    it('應該通過不含禁止詞的內容', () => {
      const result = filterContent('這是正常的評論內容');
      expect(result.pass).toBe(true);
    });

    it('應該阻擋包含 "spam" 的內容', () => {
      const result = filterContent('This is spam message');
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('forbidden_word');
    });

    it('應該阻擋包含 "viagra" 的內容', () => {
      const result = filterContent('Buy viagra now!');
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('forbidden_word');
    });

    it('應該進行不區分大小寫的檢查', () => {
      const result = filterContent('This is SPAM message');
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('forbidden_word');
    });

    it('應該檢測中間夾雜的禁止詞', () => {
      const result = filterContent('前面的文字 viagra 後面的文字');
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('forbidden_word');
    });
  });

  describe('連結數量限制', () => {
    it('應該通過不含連結的內容', () => {
      const result = filterContent('這是沒有連結的評論');
      expect(result.pass).toBe(true);
    });

    it('應該通過 1 個連結', () => {
      const result = filterContent('請參考 https://example.com 這個網站');
      expect(result.pass).toBe(true);
    });

    it('應該通過 2 個連結', () => {
      const result = filterContent(
        '參考 https://example.com 和 http://test.com'
      );
      expect(result.pass).toBe(true);
    });

    it('應該通過 3 個連結', () => {
      const result = filterContent(
        'https://a.com http://b.com https://c.com 三個連結'
      );
      expect(result.pass).toBe(true);
    });

    it('應該阻擋 4 個連結', () => {
      const result = filterContent(
        'https://a.com http://b.com https://c.com http://d.com'
      );
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('too_many_links');
    });

    it('應該阻擋 5 個以上連結', () => {
      const result = filterContent(
        'https://a.com http://b.com https://c.com http://d.com https://e.com'
      );
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('too_many_links');
    });
  });

  describe('長度限制', () => {
    it('應該阻擋少於 2 字的內容', () => {
      const result = filterContent('a');
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('content_too_short');
    });

    it('應該通過剛好 2 字的內容', () => {
      const result = filterContent('ok');
      expect(result.pass).toBe(true);
    });

    it('應該通過正常長度的內容', () => {
      const result = filterContent('這是一段正常長度的評論內容');
      expect(result.pass).toBe(true);
    });

    it('應該通過剛好 5000 字的內容', () => {
      const result = filterContent('a'.repeat(5000));
      expect(result.pass).toBe(true);
    });

    it('應該阻擋超過 5000 字的內容', () => {
      const result = filterContent('a'.repeat(5001));
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('content_too_long');
    });
  });

  describe('邊界條件', () => {
    it('應該阻擋空字串', () => {
      const result = filterContent('');
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('content_too_short');
    });

    it('應該正確處理單一空白字元', () => {
      const result = filterContent(' ');
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('content_too_short');
    });

    it('應該按原始長度計算（包含空白）', () => {
      const result = filterContent('a b'); // 3 字
      expect(result.pass).toBe(true);
    });

    it('應該通過兩個空白字元（長度 = 2）', () => {
      const result = filterContent('  '); // 長度 2，剛好達標
      expect(result.pass).toBe(true);
    });
  });
});

describe('checkAntiSpam - 整合檢查', () => {
  it('應該通過所有檢查', () => {
    const result = checkAntiSpam({
      content: '這是正常的評論內容',
      honeypot: '',
      ipAddress: '192.168.1.1',
    });
    expect(result.pass).toBe(true);
  });

  describe('Honeypot 檢查（第一層）', () => {
    it('應該在 honeypot 失敗時立即回傳', () => {
      const result = checkAntiSpam({
        content: '正常內容',
        honeypot: 'bot-filled',
        ipAddress: '192.168.1.1',
      });
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('honeypot');
    });
  });

  describe('Rate Limit 檢查（第二層）', () => {
    it('應該在 rate limit 失敗時立即回傳', async () => {
      // 先鎖定該 IP（透過 rate-limiter 的 recordFailedAttempt）
      const { recordFailedAttempt, MAX_ATTEMPTS } = await import(
        '../rate-limiter'
      );

      const testIp = '192.168.1.100';
      // 記錄足夠次數以觸發鎖定
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        recordFailedAttempt(testIp);
      }

      const result = checkAntiSpam({
        content: '正常內容',
        honeypot: '',
        ipAddress: testIp,
      });

      expect(result.pass).toBe(false);
      expect(result.reason).toBe('rate_limit');

      // 清理
      const { resetAllAttempts } = await import('../rate-limiter');
      resetAllAttempts();
    });
  });

  describe('Content Filter 檢查（第三層）', () => {
    it('應該阻擋包含禁止詞的內容', () => {
      const result = checkAntiSpam({
        content: 'This is spam',
        honeypot: '',
        ipAddress: '192.168.1.2',
      });
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('forbidden_word');
    });

    it('應該阻擋過短的內容', () => {
      const result = checkAntiSpam({
        content: 'a',
        honeypot: '',
        ipAddress: '192.168.1.3',
      });
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('content_too_short');
    });

    it('應該阻擋連結過多的內容', () => {
      const result = checkAntiSpam({
        content: 'https://a.com http://b.com https://c.com http://d.com',
        honeypot: '',
        ipAddress: '192.168.1.4',
      });
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('too_many_links');
    });
  });

  describe('檢查順序', () => {
    it('應該優先檢查 honeypot（即使其他條件也失敗）', () => {
      const result = checkAntiSpam({
        content: 'a', // 太短
        honeypot: 'bot-filled',
        ipAddress: '192.168.1.5',
      });
      expect(result.pass).toBe(false);
      expect(result.reason).toBe('honeypot'); // 不是 content_too_short
    });

    it('應該在通過 honeypot 後檢查 rate limit', async () => {
      const { recordFailedAttempt, MAX_ATTEMPTS, resetAllAttempts } =
        await import('../rate-limiter');

      const testIp = '192.168.1.101';
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        recordFailedAttempt(testIp);
      }

      const result = checkAntiSpam({
        content: 'spam message', // 包含禁止詞
        honeypot: '', // 通過
        ipAddress: testIp, // 鎖定
      });

      expect(result.pass).toBe(false);
      expect(result.reason).toBe('rate_limit'); // 不是 forbidden_word

      resetAllAttempts();
    });
  });
});
