/**
 * @file 分頁控制元件
 * @description 評論列表分頁控制
 */

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  status?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  total,
  status,
}: PaginationProps) {
  // 建立分頁 URL
  function buildPageUrl(page: number): string {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (status) {
      params.set('status', status);
    }
    return `/admin/comments?${params.toString()}`;
  }

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        共 {total} 筆，第 {currentPage}/{totalPages} 頁
      </p>
      <div className="flex space-x-2">
        {hasPrev ? (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            上一頁
          </Link>
        ) : (
          <button
            disabled
            className="cursor-not-allowed rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-400 opacity-50"
          >
            上一頁
          </button>
        )}
        {hasNext ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            下一頁
          </Link>
        ) : (
          <button
            disabled
            className="cursor-not-allowed rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-400 opacity-50"
          >
            下一頁
          </button>
        )}
      </div>
    </div>
  );
}
