'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleTocProps {
  items: TocItem[];
}

/**
 * ArticleToc 元件
 * 文章目錄導航，支援巢狀層級、active 狀態、sticky 行為
 */
export default function ArticleToc({ items }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [items]);

  if (items.length === 0) {
    return <nav aria-label="文章目錄"></nav>;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <nav 
      className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto" 
      aria-label="文章目錄"
    >
      <h2 className="text-lg font-bold mb-4">目錄</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isH3 = item.level === 3;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                className={`block py-1 transition-colors ${
                  isH3 ? 'pl-4' : ''
                } ${
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary'
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
