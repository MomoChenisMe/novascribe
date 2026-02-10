# 評論 Markdown 渲染模組使用範例

## 基本使用

```typescript
import { renderCommentMarkdown } from '@/lib/comment-markdown';

// 在 Server Component 中使用
async function CommentDisplay({ content }: { content: string }) {
  const html = await renderCommentMarkdown(content);
  
  return (
    <div 
      className="comment-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// 在 API Route 中使用
export async function POST(request: Request) {
  const { content } = await request.json();
  const html = await renderCommentMarkdown(content);
  
  return Response.json({ html });
}
```

## 支援的格式

### ✅ 支援
- **粗體**：`**bold**` → `<strong>bold</strong>`
- *斜體*：`*italic*` → `<em>italic</em>`
- `行內程式碼`：`` `code` `` → `<code>code</code>`
- 程式碼區塊：
  ````
  ```js
  const x = 1;
  ```
  ````
- 連結：`[text](url)` → `<a href="url">text</a>`
- 段落和換行

### ❌ 不支援
- 標題（h1-h6）
- 圖片
- 表格
- 列表（無序/有序）
- 引用
- 直接寫 HTML

## 安全性保證

### XSS 防護
所有危險內容會自動過濾：

```typescript
// ❌ 這些會被過濾
'<script>alert("XSS")</script>'           // → 完全移除
'<iframe src="evil.com"></iframe>'        // → 完全移除
'<a onclick="alert()">link</a>'           // → <p>link</p>
'[click](javascript:alert("XSS"))'        // → 連結被移除
'<img onerror="alert()" src="x">'         // → 完全移除

// ✅ 安全的 Markdown
'**Hello** [World](https://example.com)'  // → <p><strong>Hello</strong> <a href="https://example.com">World</a></p>
```

### 白名單機制
- **允許的標籤**：`p`, `strong`, `em`, `code`, `pre`, `a`, `br`
- **允許的屬性**：`a` 標籤只允許 `href`
- **允許的協議**：`http://`, `https://`, `mailto:`

## 測試驗證

```bash
# 執行獨立驗證腳本
cd novascribe
npx tsx src/lib/__tests__/comment-markdown.verify.ts

# 預期輸出：
# 📊 測試結果：26 通過，0 失敗
# ✅ 通過率：100.0%
```

## 與文章 Markdown 的差異

| 功能 | 文章 (`markdown.ts`) | 評論 (`comment-markdown.ts`) |
|------|---------------------|------------------------------|
| 標題 | ✅ h1-h6 | ❌ 不支援 |
| 圖片 | ✅ | ❌ 不支援 |
| 表格 | ✅ GFM 表格 | ❌ 不支援 |
| 列表 | ✅ | ❌ 不支援 |
| 程式碼高亮 | ✅ Shiki | ❌ 純文字（無語法高亮） |
| 目錄生成 | ✅ `extractToc()` | ❌ 不支援 |
| XSS 防護 | ⚠️ 依賴 Next.js | ✅ rehype-sanitize |

## 效能考量

- ✅ 使用 unified 生態系（與文章渲染統一）
- ✅ 非同步處理，不阻塞主執行緒
- ✅ 輕量級：只載入必要的外掛（無 Shiki、無 GFM）
- 💡 建議：在儲存時預渲染，避免每次請求都渲染

## 整合建議

```typescript
// 在 Prisma schema 中新增欄位
model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text  // Markdown 原始內容
  contentHtml String? @db.Text  // 預渲染的 HTML（可選）
  // ...
}

// 儲存評論時預渲染
async function createComment(content: string) {
  const contentHtml = await renderCommentMarkdown(content);
  
  return prisma.comment.create({
    data: {
      content,
      contentHtml, // 儲存預渲染結果
      // ...
    },
  });
}

// 顯示評論時直接使用
function CommentDisplay({ comment }: { comment: Comment }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: comment.contentHtml }} />
  );
}
```
