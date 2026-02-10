/**
 * @file useCommentStats Hook
 * @description 取得評論統計資料的 React Hook
 */

'use client';

import { useEffect, useState } from 'react';

interface CommentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
}

export function useCommentStats() {
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/comments/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch comment stats');
        }

        const data = await response.json();

        if (mounted) {
          setStats(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err : new Error('Unknown error')
          );
          setIsLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  return { stats, isLoading, error };
}
