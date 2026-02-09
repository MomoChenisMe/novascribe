'use client';

/**
 * @file 標籤管理頁面
 * @description 後台標籤管理，支援表格顯示、搜尋、排序、新增、編輯、刪除、清理未使用標籤。
 *   - 表格顯示：名稱、slug、使用次數、操作按鈕
 *   - 搜尋框（debounce 搜尋）
 *   - 排序（點擊表頭切換）
 *   - 新增按鈕 → 表單 modal
 *   - 編輯按鈕 → 表單 modal（預填資料）
 *   - 刪除按鈕 → 確認 modal
 *   - 「清理未使用標籤」按鈕 → 確認 modal
 *   - 分頁控制
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/** 標籤含使用次數 */
interface TagWithCount {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
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

/** 表單資料 */
interface TagFormData {
  name: string;
  slug: string;
}

const initialFormData: TagFormData = {
  name: '',
  slug: '',
};

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 搜尋、排序、分頁狀態
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'postCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal 狀態
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagWithCount | null>(null);
  const [formData, setFormData] = useState<TagFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Debounce 搜尋
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  /** 載入標籤資料 */
  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/tags?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setTags(json.data);
        setMeta(json.meta);
      }
    } catch {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Debounce 搜尋處理
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [search]);

  /** 切換排序 */
  function handleSort(field: 'name' | 'postCount') {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  }

  /** 取得排序圖示 */
  function getSortIcon(field: 'name' | 'postCount') {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  }

  /** 開啟新增表單 */
  function handleAdd() {
    setEditingTag(null);
    setFormData(initialFormData);
    setShowForm(true);
  }

  /** 開啟編輯表單 */
  function handleEdit(tag: TagWithCount) {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
    });
    setShowForm(true);
  }

  /** 開啟刪除確認 */
  function handleDelete(tag: TagWithCount) {
    setDeletingTag(tag);
    setShowDeleteConfirm(true);
  }

  /** 提交表單（新增或更新） */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = {
        name: formData.name,
        slug: formData.slug,
      };

      if (editingTag) {
        await fetch(`/api/admin/tags/${editingTag.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      setShowForm(false);
      await loadTags();
    } catch {
      // 靜默處理
    } finally {
      setSubmitting(false);
    }
  }

  /** 確認刪除 */
  async function handleConfirmDelete() {
    if (!deletingTag) return;

    try {
      await fetch(`/api/admin/tags/${deletingTag.id}`, {
        method: 'DELETE',
      });

      setShowDeleteConfirm(false);
      setDeletingTag(null);
      await loadTags();
    } catch {
      // 靜默處理
    }
  }

  /** 清理未使用標籤 */
  async function handleCleanup() {
    try {
      await fetch('/api/admin/tags/unused', {
        method: 'DELETE',
      });

      setShowCleanupConfirm(false);
      await loadTags();
    } catch {
      // 靜默處理
    }
  }

  // 載入中
  if (loading && tags.length === 0) {
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
      {/* 標題與操作按鈕 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">標籤管理</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCleanupConfirm(true)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            清理未使用標籤
          </button>
          <button
            onClick={handleAdd}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            新增標籤
          </button>
        </div>
      </div>

      {/* 搜尋框 */}
      <div>
        <input
          type="text"
          placeholder="搜尋標籤..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 標籤表格 */}
      {tags.length === 0 && !loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">尚無標籤</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  onClick={() => handleSort('name')}
                >
                  名稱 {getSortIcon('name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  onClick={() => handleSort('postCount')}
                >
                  使用次數 {getSortIcon('postCount')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {tag.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                    {tag.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                    {tag.postCount}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        刪除
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

      {/* 新增/編輯表單 Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {editingTag ? '編輯標籤' : '新增標籤'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="tag-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    名稱
                  </label>
                  <input
                    id="tag-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="tag-slug"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Slug
                  </label>
                  <input
                    id="tag-slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 刪除確認 Modal */}
      {showDeleteConfirm && deletingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              刪除確認
            </h2>
            <p className="mb-6 text-gray-600">
              確定要刪除標籤「{deletingTag.name}」嗎？此操作無法復原。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingTag(null);
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                確定刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 清理確認 Modal */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              清理確認
            </h2>
            <p className="mb-6 text-gray-600">
              確定要清理所有未使用的標籤嗎？此操作將刪除所有沒有文章關聯的標籤。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCleanupConfirm(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCleanup}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                確定清理
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
