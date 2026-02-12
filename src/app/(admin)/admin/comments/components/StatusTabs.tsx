/**
 * @file 狀態篩選 Tabs 元件
 * @description 評論狀態篩選標籤：全部、待審核、已核准、Spam、已刪除
 */

import Link from 'next/link';

interface StatusTabsProps {
  currentStatus?: string;
}

const TABS = [
  { label: '全部', value: '' },
  { label: '待審核', value: 'PENDING' },
  { label: '已核准', value: 'APPROVED' },
  { label: 'Spam', value: 'SPAM' },
  { label: '已刪除', value: 'DELETED' },
];

export default function StatusTabs({ currentStatus = '' }: StatusTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {TABS.map((tab) => {
          const isActive = currentStatus === tab.value;
          const href = tab.value
            ? `/admin/comments?status=${tab.value}`
            : '/admin/comments';

          return (
            <Link
              key={tab.value || 'all'}
              href={href}
              className={`
                whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium
                ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
