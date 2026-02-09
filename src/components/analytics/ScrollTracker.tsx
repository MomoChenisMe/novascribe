/**
 * @file ScrollTracker 元件
 * @description 追蹤使用者捲動深度（25%/50%/75%/100%），透過 GA4 發送事件
 *   - 每個深度門檻只觸發一次
 *   - 使用 scroll 事件監聽頁面捲動
 */

'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

const THRESHOLDS = [25, 50, 75, 100];

export function ScrollTracker() {
  const reachedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrollPercent = Math.round(
        (window.scrollY / scrollHeight) * 100
      );

      for (const threshold of THRESHOLDS) {
        if (
          scrollPercent >= threshold &&
          !reachedRef.current.has(threshold)
        ) {
          reachedRef.current.add(threshold);
          trackEvent('scroll_depth', {
            percent: threshold,
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}
