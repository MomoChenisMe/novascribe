import Link from 'next/link';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

/**
 * Pagination 元件
 * 
 * 分頁導航元件，支援頁碼按鈕與上一頁/下一頁。
 * 
 * Features:
 * - 顯示當前頁與總頁數
 * - 上一頁/下一頁按鈕
 * - 頁碼按鈕 (最多顯示 5 個)
 * - 當前頁高亮顯示 (Rose 600 背景)
 * - 禁用狀態樣式
 * 
 * @example
 * ```tsx
 * <Pagination currentPage={2} totalPages={10} basePath="/posts" />
 * <Pagination currentPage={1} totalPages={5} /> // basePath defaults to current path
 * ```
 */
export default function Pagination({
  currentPage,
  totalPages,
  basePath = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildPageUrl = (page: number) => {
    if (page === 1) return basePath || '/';
    return `${basePath}?page=${page}`;
  };

  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // 顯示所有頁碼
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 智能顯示頁碼
      if (currentPage <= 3) {
        // 靠近開頭
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // 省略符號
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 靠近結尾
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // 中間
        pages.push(1);
        pages.push(-1);
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(-2); // 第二個省略符號
        pages.push(totalPages);
      }
    }

    return pages.map((page, idx) => {
      if (page < 0) {
        // 省略符號
        return (
          <span
            key={`ellipsis-${idx}`}
            className="px-3 py-2 text-[var(--color-text-muted)]"
          >
            ...
          </span>
        );
      }

      const isActive = page === currentPage;
      return (
        <Link
          key={page}
          href={buildPageUrl(page)}
          className={`
            inline-flex items-center justify-center
            min-w-[40px] px-3 py-2
            rounded-lg
            text-sm font-medium
            transition-all duration-200
            ${
              isActive
                ? 'bg-[var(--color-primary)] text-white cursor-default'
                : 'bg-white text-[var(--color-text-primary)] hover:bg-stone-100'
            }
          `}
          aria-current={isActive ? 'page' : undefined}
          aria-label={`第 ${page} 頁`}
        >
          {page}
        </Link>
      );
    });
  };

  return (
    <nav
      className="flex items-center justify-center gap-2 mt-12"
      role="navigation"
      aria-label="分頁導航"
    >
      {/* 上一頁 */}
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="
            inline-flex items-center gap-1
            px-4 py-2
            rounded-lg
            text-sm font-medium
            bg-white text-[var(--color-text-primary)]
            hover:bg-stone-100
            transition-all duration-200
          "
          aria-label="上一頁"
        >
          ← 上一頁
        </Link>
      ) : (
        <span
          className="
            inline-flex items-center gap-1
            px-4 py-2
            rounded-lg
            text-sm font-medium
            bg-stone-100 text-[var(--color-text-muted)]
            cursor-not-allowed
          "
          aria-disabled="true"
        >
          ← 上一頁
        </span>
      )}

      {/* 頁碼按鈕 */}
      <div className="hidden sm:flex items-center gap-2">
        {renderPageNumbers()}
      </div>

      {/* Mobile: 只顯示當前頁/總頁數 */}
      <div className="sm:hidden px-4 py-2 text-sm text-[var(--color-text-secondary)]">
        {currentPage} / {totalPages}
      </div>

      {/* 下一頁 */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="
            inline-flex items-center gap-1
            px-4 py-2
            rounded-lg
            text-sm font-medium
            bg-white text-[var(--color-text-primary)]
            hover:bg-stone-100
            transition-all duration-200
          "
          aria-label="下一頁"
        >
          下一頁 →
        </Link>
      ) : (
        <span
          className="
            inline-flex items-center gap-1
            px-4 py-2
            rounded-lg
            text-sm font-medium
            bg-stone-100 text-[var(--color-text-muted)]
            cursor-not-allowed
          "
          aria-disabled="true"
        >
          下一頁 →
        </span>
      )}
    </nav>
  );
}
