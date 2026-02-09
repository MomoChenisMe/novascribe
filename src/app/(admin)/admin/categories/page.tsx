'use client';

/**
 * @file 分類管理頁面
 * @description 後台分類管理，支援樹狀結構顯示、新增、編輯、刪除分類。
 *   - 樹狀分類列表（縮排顯示層級）
 *   - 新增按鈕 → 表單 modal
 *   - 編輯按鈕 → 表單 modal（預填資料）
 *   - 刪除按鈕 → 確認 modal
 */

import { useState, useEffect, useCallback } from 'react';

/** 樹狀分類節點 */
interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  children: CategoryTreeNode[];
}

/** 扁平分類 */
interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
}

/** 表單資料 */
interface CategoryFormData {
  name: string;
  slug: string;
  parentId: string;
  sortOrder: number;
}

const initialFormData: CategoryFormData = {
  name: '',
  slug: '',
  parentId: '',
  sortOrder: 0,
};

export default function CategoriesPage() {
  const [treeData, setTreeData] = useState<CategoryTreeNode[]>([]);
  const [flatData, setFlatData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal 狀態
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  /** 載入分類資料 */
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [treeRes, flatRes] = await Promise.all([
        fetch('/api/admin/categories?tree=true'),
        fetch('/api/admin/categories'),
      ]);

      const treeJson = await treeRes.json();
      const flatJson = await flatRes.json();

      if (treeJson.success) {
        setTreeData(treeJson.data);
      }
      if (flatJson.success) {
        setFlatData(flatJson.data);
      }
    } catch {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /** 開啟新增表單 */
  function handleAdd() {
    setEditingCategory(null);
    setFormData(initialFormData);
    setShowForm(true);
  }

  /** 開啟編輯表單 */
  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? '',
      sortOrder: category.sortOrder,
    });
    setShowForm(true);
  }

  /** 開啟刪除確認 */
  function handleDelete(category: Category) {
    setDeletingCategory(category);
    setShowDeleteConfirm(true);
  }

  /** 提交表單（新增或更新） */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        name: formData.name,
        slug: formData.slug,
        sortOrder: formData.sortOrder,
      };

      if (formData.parentId) {
        body.parentId = formData.parentId;
      }

      if (editingCategory) {
        // 更新
        await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        // 新增
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      setShowForm(false);
      await loadCategories();
    } catch {
      // 靜默處理
    } finally {
      setSubmitting(false);
    }
  }

  /** 確認刪除 */
  async function handleConfirmDelete() {
    if (!deletingCategory) return;

    try {
      await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });

      setShowDeleteConfirm(false);
      setDeletingCategory(null);
      await loadCategories();
    } catch {
      // 靜默處理
    }
  }

  // 載入中
  if (loading) {
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
        <h1 className="text-2xl font-bold text-gray-900">分類管理</h1>
        <button
          onClick={handleAdd}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          新增分類
        </button>
      </div>

      {/* 分類列表 */}
      {treeData.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">尚無分類</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <CategoryTreeList
            nodes={treeData}
            level={0}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* 新增/編輯表單 Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              {editingCategory ? '編輯分類' : '新增分類'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">
                    名稱
                  </label>
                  <input
                    id="category-name"
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
                  <label htmlFor="category-slug" className="block text-sm font-medium text-gray-700">
                    Slug
                  </label>
                  <input
                    id="category-slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category-parent" className="block text-sm font-medium text-gray-700">
                    父分類
                  </label>
                  <select
                    id="category-parent"
                    value={formData.parentId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, parentId: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">無（根分類）</option>
                    {flatData
                      .filter((c) => c.id !== editingCategory?.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="category-sort" className="block text-sm font-medium text-gray-700">
                    排序
                  </label>
                  <input
                    id="category-sort"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sortOrder: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min={0}
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
      {showDeleteConfirm && deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              刪除確認
            </h2>
            <p className="mb-6 text-gray-600">
              確定要刪除分類「{deletingCategory.name}」嗎？此操作無法復原。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingCategory(null);
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
    </div>
  );
}

/** 樹狀分類列表元件（遞迴） */
function CategoryTreeList({
  nodes,
  level,
  onEdit,
  onDelete,
}: {
  nodes: CategoryTreeNode[];
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <ul className={level > 0 ? '' : ''}>
      {nodes.map((node) => (
        <li key={node.id}>
          <div
            className="flex items-center justify-between border-b border-gray-100 px-4 py-3 hover:bg-gray-50"
            style={{ paddingLeft: `${level * 24 + 16}px` }}
          >
            <div className="flex items-center space-x-2">
              {level > 0 && (
                <span className="text-gray-400">└</span>
              )}
              <span className="font-medium text-gray-900">{node.name}</span>
              <span className="text-sm text-gray-500">({node.slug})</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  onEdit({
                    id: node.id,
                    name: node.name,
                    slug: node.slug,
                    parentId: node.parentId,
                    sortOrder: node.sortOrder,
                  })
                }
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                編輯
              </button>
              <button
                onClick={() =>
                  onDelete({
                    id: node.id,
                    name: node.name,
                    slug: node.slug,
                    parentId: node.parentId,
                    sortOrder: node.sortOrder,
                  })
                }
                className="text-sm text-red-600 hover:text-red-800"
              >
                刪除
              </button>
            </div>
          </div>
          {node.children.length > 0 && (
            <CategoryTreeList
              nodes={node.children}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
