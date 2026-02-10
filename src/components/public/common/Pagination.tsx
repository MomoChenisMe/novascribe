import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

/**
 * Pagination 元件
 * 顯示分頁導航（頁碼、上/下一頁、總頁數）
 */
export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) {
    return <nav></nav>;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // 最多顯示 7 個頁碼

    if (totalPages <= maxVisible) {
      // 總頁數少於等於最大顯示數，全部顯示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 總頁數多，顯示省略符號
      if (currentPage <= 3) {
        // 當前頁在前面
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 當前頁在後面
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 當前頁在中間
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="分頁導航">
      {/* 上一頁 */}
      <Link
        href={currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : '#'}
        className={`px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
          currentPage === 1 ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        上一頁
      </Link>

      {/* 頁碼 */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-4 py-2 text-gray-400 dark:text-gray-600"
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <Link
            key={pageNum}
            href={`${basePath}?page=${pageNum}`}
            className={`px-4 py-2 rounded-md border transition-colors ${
              isActive
                ? 'bg-primary text-white border-primary'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {pageNum}
          </Link>
        );
      })}

      {/* 下一頁 */}
      <Link
        href={currentPage < totalPages ? `${basePath}?page=${currentPage + 1}` : '#'}
        className={`px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
          currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        下一頁
      </Link>

      {/* 總頁數資訊 */}
      <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
        共 {totalPages} 頁
      </span>
    </nav>
  );
}
