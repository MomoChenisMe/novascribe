'use client';

/**
 * @file 側邊欄元件
 * @description 後台管理側邊欄導覽，支援收合/展開及響應式佈局。
 *   - 導覽項目：儀表板、文章、分類、標籤、媒體、SEO、設定
 *   - 當前頁面高亮（使用 usePathname()）
 *   - 可收合/展開（桌面模式）
 *   - Modern Rose Design System 配色
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** 導覽項目定義 */
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

/** Sidebar 元件 props */
interface SidebarProps {
  /** 是否收合 */
  collapsed: boolean;
  /** 切換收合/展開 */
  onToggle: () => void;
  /** 待審核評論數 */
  pendingCount?: number;
}

/** SVG icon 元件（簡化版，使用 emoji 作為替代） */
function NavIcon({ label }: { label: string }) {
  const icons: Record<string, string> = {
    儀表板: '📊',
    文章: '📝',
    分類: '📁',
    標籤: '🏷️',
    媒體: '🖼️',
    評論管理: '💬',
    SEO: '🔍',
    設定: '⚙️',
  };
  return <span aria-hidden="true">{icons[label] || '📄'}</span>;
}

/** 導覽項目清單 */
const navItems: NavItem[] = [
  { label: '儀表板', href: '/admin', icon: <NavIcon label="儀表板" /> },
  { label: '文章', href: '/admin/posts', icon: <NavIcon label="文章" /> },
  { label: '分類', href: '/admin/categories', icon: <NavIcon label="分類" /> },
  { label: '標籤', href: '/admin/tags', icon: <NavIcon label="標籤" /> },
  { label: '媒體', href: '/admin/media', icon: <NavIcon label="媒體" /> },
  { label: '評論管理', href: '/admin/comments', icon: <NavIcon label="評論管理" /> },
  { label: 'SEO', href: '/admin/seo', icon: <NavIcon label="SEO" /> },
  { label: '設定', href: '/admin/settings', icon: <NavIcon label="設定" /> },
];

/**
 * 判斷路徑是否為當前頁面
 * - /admin 精確匹配
 * - 其他頁面支援子路徑匹配（如 /admin/posts/123 匹配 /admin/posts）
 */
function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  return pathname.startsWith(href);
}

export function Sidebar({ collapsed, onToggle, pendingCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  /** 格式化 badge 數字（>99 顯示為 99+） */
  const formatBadgeCount = (count: number) => {
    return count > 99 ? '99+' : count.toString();
  };

  return (
    <nav
      aria-label="側邊欄"
      className={`flex h-full flex-col bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border-light)] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* 導覽項目 */}
      <ul className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const showBadge = item.label === '評論管理' && pendingCount > 0;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-stone-50'
                } ${collapsed ? 'justify-center' : 'gap-3'}`}
              >
                <span className="flex-shrink-0 text-lg">{item.icon}</span>
                {collapsed ? (
                  <>
                    <span className="sr-only">{item.label}</span>
                    {showBadge && (
                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-error)] text-xs font-bold text-white">
                        {formatBadgeCount(pendingCount)}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {showBadge && (
                      <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-error)] px-1.5 text-xs font-bold text-white">
                        {formatBadgeCount(pendingCount)}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* 收合/展開按鈕 */}
      <div className="border-t border-[var(--color-border-light)] p-2">
        <button
          onClick={onToggle}
          aria-label={collapsed ? '展開側邊欄' : '收合側邊欄'}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-stone-50 hover:text-[var(--color-primary)]"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
    </nav>
  );
}
