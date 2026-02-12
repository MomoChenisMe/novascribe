#!/usr/bin/env tsx
/**
 * 評論 Markdown 渲染模組驗證腳本
 * 
 * 由於 unified 生態系是 pure ESM，無法在 Jest 的 CommonJS 環境中測試
 * 此腳本使用 tsx 直接執行測試，驗證所有功能
 * 
 * 執行方式：npx tsx src/lib/__tests__/comment-markdown.verify.ts
 */

import { renderCommentMarkdown } from '../comment-markdown';

interface TestCase {
  name: string;
  input: string;
  expectations: {
    contains?: string[];
    notContains?: string[];
  };
}

const testCases: TestCase[] = [
  // 基本 Markdown 格式
  {
    name: '粗體',
    input: '**bold**',
    expectations: {
      contains: ['<strong>bold</strong>'],
    },
  },
  {
    name: '斜體',
    input: '*italic*',
    expectations: {
      contains: ['<em>italic</em>'],
    },
  },
  {
    name: '行內程式碼',
    input: '`code`',
    expectations: {
      contains: ['<code>code</code>'],
    },
  },
  {
    name: '程式碼區塊',
    input: '```js\ncode\n```',
    expectations: {
      contains: ['<pre><code', 'code', '</code></pre>'],
    },
  },
  {
    name: '連結',
    input: '[text](url)',
    expectations: {
      contains: ['<a href="url">text</a>'],
    },
  },
  {
    name: '段落',
    input: 'Hello world',
    expectations: {
      contains: ['<p>Hello world</p>'],
    },
  },
  {
    name: '換行',
    input: 'Line 1\n\nLine 2',
    expectations: {
      contains: ['<p>Line 1</p>', '<p>Line 2</p>'],
    },
  },

  // 格式限制
  {
    name: '不支援標題（h1-h6）',
    input: '# Heading 1\n## Heading 2\n### Heading 3',
    expectations: {
      contains: ['Heading 1', 'Heading 2', 'Heading 3'],
      notContains: ['<h1', '<h2', '<h3'],
    },
  },
  {
    name: '不支援圖片',
    input: '![alt](image.png)',
    expectations: {
      notContains: ['<img'],
    },
  },
  {
    name: '不支援表格',
    input: '| col1 | col2 |\n|------|------|\n| val1 | val2 |',
    expectations: {
      notContains: ['<table', '<thead', '<tbody'],
    },
  },

  // XSS 防護
  {
    name: '過濾 <script> 標籤',
    input: '<script>alert("XSS")</script>',
    expectations: {
      notContains: ['<script', 'alert'],
    },
  },
  {
    name: '過濾 <iframe> 標籤',
    input: '<iframe src="evil.com"></iframe>',
    expectations: {
      notContains: ['<iframe'],
    },
  },
  {
    name: '移除 onclick 屬性',
    input: '<a onclick="alert()">link</a>',
    expectations: {
      notContains: ['onclick'],
    },
  },
  {
    name: '移除 onload 屬性',
    input: '<img onload="alert()" src="x">',
    expectations: {
      notContains: ['onload', '<img'],
    },
  },
  {
    name: '移除 onerror 屬性',
    input: '<img onerror="alert()" src="x">',
    expectations: {
      notContains: ['onerror', '<img'],
    },
  },
  {
    name: '過濾 javascript: 協議',
    input: '[click](javascript:alert("XSS"))',
    expectations: {
      notContains: ['javascript:'],
    },
  },
  {
    name: '過濾 data: 協議',
    input: '[click](data:text/html,<script>alert("XSS")</script>)',
    expectations: {
      notContains: ['data:'],
    },
  },
  {
    name: '過濾 vbscript: 協議',
    input: '[click](vbscript:msgbox("XSS"))',
    expectations: {
      notContains: ['vbscript:'],
    },
  },

  // 白名單
  {
    name: '保留白名單標籤',
    input: '**bold** *italic* `code`\n\n[link](url)',
    expectations: {
      contains: ['<p>', '<strong>', '<em>', '<code>', '<a'],
    },
  },
  {
    name: '移除非白名單標籤（直接 HTML 應完全過濾）',
    input: '<div>test</div><span>test</span><section>test</section>',
    expectations: {
      // 直接寫 HTML 應該被完全移除（包括內容），這是安全的行為
      notContains: ['<div', '<span', '<section', 'test'],
    },
  },
  {
    name: '不允許直接寫 HTML 連結',
    input: '<a href="url" class="test" id="link" title="test">link</a>',
    expectations: {
      // 直接寫 HTML 應該被過濾，只保留文字內容
      contains: ['link'],
      notContains: ['<a', 'href=', 'class=', 'id=', 'title='],
    },
  },
  {
    name: 'Markdown 連結應保留',
    input: '[link](https://example.com)',
    expectations: {
      contains: ['<a href="https://example.com">link</a>'],
      notContains: ['class=', 'id=', 'title='],
    },
  },

  // 邊界情況
  {
    name: '空字串',
    input: '',
    expectations: {
      contains: [''],
    },
  },
  {
    name: '純文字',
    input: 'Just plain text',
    expectations: {
      contains: ['Just plain text'],
    },
  },
  {
    name: '混合格式',
    input: '這是 **粗體** 和 *斜體* 還有 `程式碼` 以及 [連結](https://example.com)',
    expectations: {
      contains: [
        '<strong>粗體</strong>',
        '<em>斜體</em>',
        '<code>程式碼</code>',
        '<a href="https://example.com">連結</a>',
      ],
    },
  },
];

async function runTests() {
  console.log('🧪 開始驗證評論 Markdown 渲染模組\n');

  let passed = 0;
  let failed = 0;

  // 測試 null 輸入
  const nullResult = await renderCommentMarkdown(null);
  if (nullResult === '') {
    console.log('✅ null 輸入測試通過');
    passed++;
  } else {
    console.log(`❌ null 輸入測試失敗：期望空字串，得到 "${nullResult}"`);
    failed++;
  }

  for (const testCase of testCases) {
    const output = await renderCommentMarkdown(testCase.input);

    let testPassed = true;
    const errors: string[] = [];

    // 檢查應該包含的內容
    if (testCase.expectations.contains) {
      for (const expected of testCase.expectations.contains) {
        if (!output.includes(expected)) {
          testPassed = false;
          errors.push(`缺少期望內容: "${expected}"`);
        }
      }
    }

    // 檢查不應該包含的內容
    if (testCase.expectations.notContains) {
      for (const unexpected of testCase.expectations.notContains) {
        if (output.includes(unexpected)) {
          testPassed = false;
          errors.push(`包含非期望內容: "${unexpected}"`);
        }
      }
    }

    if (testPassed) {
      console.log(`✅ ${testCase.name}`);
      passed++;
    } else {
      console.log(`❌ ${testCase.name}`);
      errors.forEach((err) => console.log(`   ${err}`));
      console.log(`   輸入: ${testCase.input}`);
      console.log(`   輸出: ${output}`);
      failed++;
    }
  }

  console.log(`\n📊 測試結果：${passed} 通過，${failed} 失敗`);
  console.log(`✅ 通過率：${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error('❌ 測試執行失敗:', error);
  process.exit(1);
});
