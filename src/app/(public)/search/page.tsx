'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/public/common/SearchBar';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface SearchResponse {
  results: SearchResult[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

/**
 * 搜尋結果頁面
 */
export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&page=${page}`
        );

        if (!response.ok) {
          throw new Error('搜尋失敗，請稍後再試');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '搜尋失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* 搜尋輸入框 */}
        <div className="mb-8">
          <SearchBar defaultValue={query || ''} />
        </div>

        {/* 搜尋資訊 */}
        {query && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              搜尋：{query}
            </h1>
            {data && !loading && (
              <p className="text-gray-600 dark:text-gray-400">
                找到 {data.pagination.total} 篇文章
              </p>
            )}
          </div>
        )}

        {/* 無搜尋關鍵字 */}
        {!query && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              請輸入搜尋關鍵字
            </p>
          </div>
        )}

        {/* 載入中 */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">載入中...</p>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* 搜尋結果 */}
        {!loading && data && data.results.length > 0 && (
          <div className="space-y-6">
            {data.results.map((result) => (
              <article
                key={result.id}
                className="border-b border-gray-200 dark:border-gray-700 pb-6"
              >
                <Link
                  href={`/posts/${result.slug}`}
                  className="block group"
                >
                  <h2
                    className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    dangerouslySetInnerHTML={{ __html: result.title }}
                  />
                  <p
                    className="text-gray-600 dark:text-gray-400 mb-3"
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                    <time>
                      {new Date(result.publishedAt).toLocaleDateString('zh-TW')}
                    </time>
                    {result.category && (
                      <Link
                        href={`/categories/${result.category.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {result.category.name}
                      </Link>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* 無結果 */}
        {!loading && data && data.results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              找不到符合的文章，請嘗試其他關鍵字
            </p>
          </div>
        )}

        {/* 分頁導航 */}
        {!loading && data && data.pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={`/search?q=${encodeURIComponent(query || '')}&page=${pageNum}`}
                  className={`px-4 py-2 rounded ${
                    pageNum === data.pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
