interface ArticleContentProps {
  html: string;
}

/**
 * ArticleContent 元件
 * 渲染 Markdown 轉換後的 HTML 內容
 * 包含程式碼區塊樣式、圖片響應式處理
 */
export default function ArticleContent({ html }: ArticleContentProps) {
  return (
    <article
      className="prose prose-cjk prose-lg max-w-none dark:prose-invert
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-p:text-gray-700 dark:prose-p:text-gray-300
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
        prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
        prose-img:rounded-lg prose-img:shadow-md
        prose-table:border-collapse prose-table:w-full
        prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2
        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-2
        prose-ul:list-disc prose-ol:list-decimal
        prose-li:text-gray-700 dark:prose-li:text-gray-300"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
