'use client';

import { useEffect, useState } from 'react';

interface TOCProps {
  headings: Array<{
    id: string;
    text: string;
    level: 2 | 3; // h2 or h3
  }>;
}

/**
 * TOC (Table of Contents) 元件
 * 
 * 文章目錄導航，支援：
 * - Sticky 定位 (sticky top-24)
 * - IntersectionObserver 監聽當前章節
 * - 高亮當前章節 (text-primary / Rose 600)
 * - 平滑捲動跳轉
 * 
 * @param headings - 從 Markdown 解析的標題列表 (h2/h3)
 */
export default function TOC({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    // 使用 IntersectionObserver 監聽章節可見性
    const observer = new IntersectionObserver(
      (entries) => {
        // 找出最上方可見的 heading
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // 取第一個進入視窗的元素作為當前章節
          const topEntry = visibleEntries.reduce((top, current) => {
            return current.boundingClientRect.top < top.boundingClientRect.top
              ? current
              : top;
          });
          setActiveId(topEntry.target.id);
        }
      },
      {
        // rootMargin: 向上偏移 80px (考慮 sticky navbar)，向下保留 80% 視窗
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    // 觀察所有 heading 元素
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup: 移除所有觀察
    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  // 空目錄不渲染
  if (headings.length === 0) {
    return null;
  }

  /**
   * 處理目錄項目點擊
   * 使用 smooth scroll 平滑捲動至對應章節
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // 平滑捲動至目標元素
      window.scrollTo({
        top: element.offsetTop - 96, // 96px = top-24 (6rem)
        behavior: 'smooth',
      });
      // 立即更新高亮狀態
      setActiveId(id);
    }
  };

  return (
    <nav className="sticky top-24 h-fit" aria-label="文章目錄">
      <h2 className="text-lg font-semibold mb-4 text-text-primary">目錄</h2>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isH3 = heading.level === 3;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`block py-1 transition-colors ${
                  isH3 ? 'pl-4' : ''
                } ${
                  isActive
                    ? 'text-primary font-medium' // Rose 600 高亮
                    : 'text-text-secondary hover:text-primary' // Stone 600 預設，hover Rose 600
                }`}
                aria-current={isActive ? 'location' : undefined}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
