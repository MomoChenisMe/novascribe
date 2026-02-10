import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeShiki from '@shikijs/rehype';
import rehypeSlug from 'rehype-slug';
import readingTime from 'reading-time';
import type { Root } from 'mdast';
import type { Heading } from 'mdast';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * 渲染 Markdown 為 HTML
 * 支援 GitHub Flavored Markdown（表格、刪除線、任務清單）
 * 支援 Shiki 程式碼高亮（零 runtime JavaScript）
 * 自動為 heading 生成 ID（目錄導航用）
 */
export async function renderMarkdown(content: string | null): Promise<string> {
  if (!content) {
    return '';
  }

  const processor = unified()
    .use(remarkParse) // Markdown → MDAST
    .use(remarkGfm) // GFM 支援（表格、刪除線、任務清單）
    .use(remarkRehype) // MDAST → HAST
    .use(rehypeSlug) // 自動為 heading 添加 ID 屬性
    .use(rehypeShiki, {
      // Shiki 程式碼高亮設定
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false, // 使用 CSS 變數切換主題
      langs: [
        // 常用語言
        'typescript',
        'javascript',
        'python',
        'bash',
        'shell',
        'css',
        'html',
        'json',
        'sql',
        'tsx',
        'jsx',
      ],
    })
    .use(rehypeStringify); // HAST → HTML

  const result = await processor.process(content);
  return String(result);
}

/**
 * 從 Markdown 內容中提取目錄（Table of Contents）
 * 僅提取 H2 和 H3 標題
 */
export async function extractToc(content: string | null): Promise<TocItem[]> {
  if (!content) {
    return [];
  }

  const processor = unified().use(remarkParse).use(remarkGfm);

  const tree = processor.parse(content) as Root;
  const toc: TocItem[] = [];

  // 追蹤已使用的 ID，避免重複
  const usedIds = new Set<string>();

  const visit = (node: any) => {
    if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
      const heading = node as Heading;
      // 提取 heading 文字內容
      const text = heading.children
        .filter((child: any) => child.type === 'text')
        .map((child: any) => child.value)
        .join('');

      // 生成 ID（與 rehype-slug 的邏輯一致）
      let id = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u4e00-\u9fa5-]/g, '');

      // 處理重複 ID
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      usedIds.add(uniqueId);

      toc.push({
        id: uniqueId,
        text,
        level: heading.depth,
      });
    }

    // 遞迴遍歷子節點
    if (node.children) {
      node.children.forEach(visit);
    }
  };

  visit(tree);
  return toc;
}

/**
 * 計算文章閱讀時間
 * 中文：約 400-500 字/分鐘
 * 英文：約 200-250 字/分鐘
 * reading-time 套件會自動處理中英文混合內容
 * 
 * @param content - Markdown 原始內容
 * @returns 閱讀時間（分鐘），最小值為 1
 */
export function calculateReadingTime(content: string | null): number {
  if (!content) {
    return 1;
  }

  // reading-time 預設英文 200 wpm，對中文文章需調整
  // 中文字數計算：每個中文字符算 1 個詞
  const result = readingTime(content, {
    wordsPerMinute: 400, // 中文閱讀速度約 400-500 字/分鐘
  });

  // 向上取整，最小值為 1 分鐘
  return Math.max(1, Math.ceil(result.minutes));
}
