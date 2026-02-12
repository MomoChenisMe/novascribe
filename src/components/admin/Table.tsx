import { ReactNode } from 'react';

/**
 * 表格欄位定義
 */
export interface TableColumn {
  key: string;
  label: string;
  /** 欄位寬度 (可選) */
  width?: string;
  /** 自訂對齊方式 (預設為 left) */
  align?: 'left' | 'center' | 'right';
}

/**
 * Table 元件 Props
 */
export interface TableProps {
  /** 表格欄位定義 */
  columns: TableColumn[];
  /** 表格資料 */
  data: Array<Record<string, any>>;
  /** 操作按鈕區域 (可選) */
  actions?: (row: any) => ReactNode;
  /** 是否顯示載入狀態 */
  loading?: boolean;
  /** 空狀態文字 */
  emptyText?: string;
}

/**
 * Admin Table 元件
 * 
 * 簡潔的後台表格元件，支援自訂欄位與操作按鈕。
 * 
 * Features:
 * - 表格標題: Stone 100 背景、font-semibold
 * - Hover 列背景: Stone 50
 * - 響應式佈局
 * 
 * @example
 * ```tsx
 * <Table
 *   columns={[
 *     { key: 'title', label: '標題' },
 *     { key: 'status', label: '狀態' },
 *     { key: 'createdAt', label: '建立日期' },
 *   ]}
 *   data={posts}
 *   actions={(row) => (
 *     <>
 *       <button onClick={() => handleEdit(row.id)}>編輯</button>
 *       <button onClick={() => handleDelete(row.id)}>刪除</button>
 *     </>
 *   )}
 * />
 * ```
 */
export default function Table({
  columns,
  data,
  actions,
  loading = false,
  emptyText = '暫無資料',
}: TableProps) {
  // 載入狀態
  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-bg-card)] overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <p className="text-[var(--color-text-muted)]">載入中...</p>
        </div>
      </div>
    );
  }

  // 空狀態
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-bg-card)] overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <p className="text-[var(--color-text-muted)]">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-border-light)] bg-[var(--color-bg-card)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--color-border-light)]">
          {/* 表格標題 */}
          <thead className="bg-stone-100">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]"
                >
                  操作
                </th>
              )}
            </tr>
          </thead>

          {/* 表格內容 */}
          <tbody className="divide-y divide-[var(--color-border-light)]">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="transition-colors duration-200 hover:bg-stone-50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm text-[var(--color-text-primary)] ${
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
