/**
 * @file ReadTimeTracker 元件
 * @description 追蹤使用者在頁面的閱讀時間
 *   - 進入頁面時開始計時
 *   - 離開頁面（beforeunload / visibilitychange）時發送閱讀時間事件
 */

'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

export function ReadTimeTracker() {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    const sendReadTime = () => {
      const elapsed = Math.round(
        (Date.now() - startTimeRef.current) / 1000
      );
      trackEvent('read_time', {
        seconds: elapsed,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendReadTime();
      }
    };

    const handleBeforeUnload = () => {
      sendReadTime();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
