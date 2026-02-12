'use client';

/**
 * @file SEO 搜尋結果預覽元件
 * @description 模擬 Google 搜尋結果的外觀，即時預覽 SEO meta 設定效果
 *   - 顯示 meta title（截斷至 60 字元）
 *   - 顯示 URL（breadcrumb 格式）
 *   - 顯示 meta description（截斷至 160 字元）
 *   - 未設定時顯示預設值
 */

/** SeoPreview 元件 props */
export interface SeoPreviewProps {
  /** Meta title */
  title?: string | null;
  /** Meta description */
  description?: string | null;
  /** 頁面 URL 或 slug */
  url?: string;
  /** 網站名稱 */
  siteName?: string;
}

/** 截斷文字 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function SeoPreview({
  title,
  description,
  url = 'https://example.com',
  siteName = 'NovaScribe',
}: SeoPreviewProps) {
  const displayTitle = title?.trim()
    ? truncate(title, 60)
    : '未設定標題 — 請輸入 Meta Title';
  const displayDescription = description?.trim()
    ? truncate(description, 160)
    : '未設定描述 — 請輸入 Meta Description 以改善搜尋結果的點擊率。';
  const displayUrl = url || 'https://example.com';

  return (
    <div
      aria-label="Google 搜尋結果預覽"
      className="rounded-lg border border-gray-200 bg-white p-4"
    >
      <p className="mb-1 text-xs text-gray-500">搜尋結果預覽</p>

      {/* URL breadcrumb */}
      <div className="mb-1 flex items-center gap-1">
        <span
          className="max-w-xs truncate text-sm text-green-700"
          data-testid="preview-url"
        >
          {displayUrl}
        </span>
        <span className="text-xs text-gray-400">› {siteName}</span>
      </div>

      {/* Title */}
      <h3
        className="mb-1 text-xl font-medium text-blue-800 hover:underline"
        data-testid="preview-title"
      >
        {displayTitle}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed text-gray-600"
        data-testid="preview-description"
      >
        {displayDescription}
      </p>
    </div>
  );
}
