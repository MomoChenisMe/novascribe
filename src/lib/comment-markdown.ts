import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import type { Schema } from 'hast-util-sanitize';

/**
 * 評論 Markdown 渲染函式
 * 
 * 功能限制：
 * - 支援格式：粗體、斜體、行內程式碼、程式碼區塊、連結、段落、換行
 * - 不支援：標題（h1-h6）、圖片、表格、HTML
 * 
 * 安全性：
 * - 使用 rehype-sanitize 過濾 XSS 攻擊
 * - 白名單標籤：p, strong, em, code, pre, a, br
 * - 白名單屬性：a 標籤只允許 href
 * - 過濾危險協議：javascript:, data:, vbscript:
 * 
 * @param content - Markdown 原始內容
 * @returns 安全的 HTML 字串
 */
export async function renderCommentMarkdown(content: string | null): Promise<string> {
  if (!content) {
    return '';
  }

  // 自訂 sanitize schema，限制允許的標籤和屬性
  const commentSchema: Schema = {
    ...defaultSchema,
    // 只允許白名單標籤
    tagNames: ['p', 'strong', 'em', 'code', 'pre', 'a', 'br'],
    // 設定每個標籤允許的屬性
    attributes: {
      ...defaultSchema.attributes,
      // a 標籤只允許 href 屬性
      a: ['href'],
      // 其他標籤不允許任何屬性
      '*': [],
    },
    // 只允許安全的協議
    protocols: {
      href: ['http', 'https', 'mailto'],
    },
    // 移除所有非白名單標籤（預設會保留內容）
    strip: ['script', 'iframe', 'style', 'link', 'meta'],
  };

  const processor = unified()
    .use(remarkParse) // Markdown → MDAST
    .use(remarkRehype) // MDAST → HAST
    .use(rehypeSanitize, commentSchema) // 套用自訂 sanitize schema
    .use(rehypeStringify); // HAST → HTML

  const result = await processor.process(content);
  return String(result);
}
