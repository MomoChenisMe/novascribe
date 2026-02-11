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
      className="prose prose-cjk prose-lg max-w-none dark:prose-invert leading-relaxed
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
        prose-img:rounded-lg prose-img:shadow-md
        prose-table:border-collapse prose-table:w-full
        prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2
        prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
