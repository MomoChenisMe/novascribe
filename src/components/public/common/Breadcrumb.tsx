import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb 元件
 * 顯示麵包屑導航路徑（首頁 → 分類 → 文章）
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) {
    return <nav aria-label="麵包屑導航"></nav>;
  }

  return (
    <nav aria-label="麵包屑導航" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              {!isLast && item.href ? (
                <>
                  <Link 
                    href={item.href} 
                    className="hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                  {index < items.length - 1 && (
                    <span className="text-gray-400 dark:text-gray-600">/</span>
                  )}
                </>
              ) : (
                <span className={isLast ? 'text-gray-900 dark:text-gray-100 font-medium' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
