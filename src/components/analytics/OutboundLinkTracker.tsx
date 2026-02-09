/**
 * @file OutboundLinkTracker 元件
 * @description 追蹤外部連結點擊事件
 *   - 點擊外部連結（http/https 開頭且非同域名）時發送事件
 *   - 站內連結不觸發
 */

'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function OutboundLinkTracker() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const href = anchor.href;
      if (!href) return;

      try {
        const url = new URL(href);
        if (url.hostname !== window.location.hostname) {
          trackEvent('outbound_link', {
            url: href,
            link_text: anchor.textContent?.trim() || '',
          });
        }
      } catch {
        // ignore invalid URLs
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
