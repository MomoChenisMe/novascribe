'use client';

/**
 * @file 文章列表頁面
 * @description 後台文章管理列表，支援表格顯示、篩選、搜尋、排序、分頁、批次操作。
 *   - 表格欄位：標題、狀態、分類、發佈時間、更新時間、操作按鈕
 *   - 篩選：狀態（ALL/DRAFT/PUBLISHED/SCHEDULED/ARCHIVED）、分類下拉
 *   - 搜尋：標題/內容（debounce 500ms）
 *   - 排序：發佈時間/更新時間
 *   - 分頁：每頁 10 筆
 *   - 批次操作：勾選多筆 → 批次刪除/發佈/下架
 *   - 新增按鈕 → /admin/posts/new
 *   - 編輯按鈕 → /admin/posts/[id]/edit
 *   - 版本按鈕 → /admin/posts/[id]/versions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

/** 分類 */
interface Category {
  id: string;
  name: string;
  slug: string;
}

/** 文章（列表用） */
interface PostItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: Category | null;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
}

/** 分頁元資料 */
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** 狀態顯示映射 */
const STATUS_LABELS: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已發佈',
  SCHEDULED: '排程中',
  ARCHIVED: '已封存',
};

/** 狀態顏色映射 */
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-yellow-100 text-yellow-800',
};

/** 格式化日期 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PostsPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 篩選、搜尋、排序、分頁狀態
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'publishedAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // 批次操作
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [batchAction, setBatchAction] = useState<'delete' | 'publish' | 'archive' | null>(null);

  // Debounce 搜尋
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 載入分類列表 */
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch {
      // 靜默處理
    }
  }, []);

  /** 載入文章列表 */
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('categoryId', categoryFilter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const res = await fetch(`/api/admin/posts?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setPosts(json.data);
        setMeta(json.meta);
      }
    } catch {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, categoryFilter, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Debounce 搜尋處理
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [search]);

  /** 切換排序 */
  function handleSort(field: 'publishedAt' | 'updatedAt') {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  }

  /** 取得排序圖示 */
  function getSortIcon(field: string) {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  }

  /** 全選/取消全選 */
  function handleSelectAll() {
    if (selectedIds.size === posts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts.map((p) => p.id)));
    }
  }

  /** 單筆選取/取消 */
  function handleSelectOne(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  /** 開啟批次確認 */
  function openBatchConfirm(action: 'delete' | 'publish' | 'archive') {
    setBatchAction(action);
    setShowBatchConfirm(true);
  }

  /** 執行批次操作 */
  async function handleBatchConfirm() {
    if (!batchAction || selectedIds.size === 0) return;

    try {
      await fetch('/api/admin/posts/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: batchAction,
          ids: Array.from(selectedIds),
        }),
      });

      setShowBatchConfirm(false);
      setBatchAction(null);
      setSelectedIds(new Set());
      await loadPosts();
    } catch {
      // 靜默處理
    }
  }

  const batchActionLabels: Record<string, string> = {
    delete: '刪除',
    publish: '發佈',
    archive: '下架',
  };

  // 載入中
  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  // 錯誤
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題與新增按鈕 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <button
          onClick={() => router.push('/admin/posts/new')}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          新增文章
        </button>
      </div>

      {/* 篩選與搜尋列 */}
      <div className="flex flex-wrap items-center gap-4">
        {/* 狀態篩選 */}
        <div>
          <label htmlFor="status-filter" className="sr-only">
            狀態篩選
          </label>
          <select
            id="status-filter"
            aria-label="狀態篩選"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">全部狀態</option>
            <option value="DRAFT">草稿</option>
            <option value="PUBLISHED">已發佈</option>
            <option value="SCHEDULED">排程中</option>
            <option value="ARCHIVED">已封存</option>
          </select>
        </div>

        {/* 分類篩選 */}
        <div>
          <label htmlFor="category-filter" className="sr-only">
            分類篩選
          </label>
          <select
            id="category-filter"
            aria-label="分類篩選"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">全部分類</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 搜尋框 */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜尋文章..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 批次操作列 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-md bg-blue-50 px-4 py-2">
          <span className="text-sm text-blue-700">
            已選取 {selectedIds.size} 筆
          </span>
          <button
            onClick={() => openBatchConfirm('delete')}
            className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
          >
            批次刪除
          </button>
          <button
            onClick={() => openBatchConfirm('publish')}
            className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
          >
            批次發佈
          </button>
          <button
            onClick={() => openBatchConfirm('archive')}
            className="rounded-md bg-yellow-600 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-700"
          >
            批次下架
          </button>
        </div>
      )}

      {/* 文章表格 */}
      {posts.length === 0 && !loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">尚無文章</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    aria-label="全選"
                    checked={selectedIds.size === posts.length && posts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  標題
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  狀態
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  分類
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => handleSort('publishedAt')}
                    className="text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  >
                    發佈時間 {getSortIcon('publishedAt')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => handleSort('updatedAt')}
                    className="text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  >
                    更新時間 {getSortIcon('updatedAt')}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`選取 ${post.title}`}
                      checked={selectedIds.has(post.id)}
                      onChange={() => handleSelectOne(post.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {post.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        STATUS_COLORS[post.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {STATUS_LABELS[post.status] || post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {post.category?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(post.updatedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => router.push(`/admin/posts/${post.id}/versions`)}
                        className="text-sm text-purple-600 hover:text-purple-800"
                      >
                        版本
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分頁控制 */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            共 {meta.total} 筆，第 {meta.page}/{meta.totalPages} 頁
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!meta.hasPrev}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!meta.hasNext}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      )}

      {/* 批次操作確認 Modal */}
      {showBatchConfirm && batchAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              批次操作確認
            </h2>
            <p className="mb-6 text-gray-600">
              確定要批次{batchActionLabels[batchAction]}已選取的 {selectedIds.size} 筆文章嗎？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBatchConfirm(false);
                  setBatchAction(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleBatchConfirm}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
