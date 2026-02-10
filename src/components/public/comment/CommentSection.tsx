'use client';

import { useEffect, useState } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  replies: Comment[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalComments: number;
}

interface CommentResponse {
  comments: Comment[];
  pagination: Pagination;
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = async (page: number, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/posts/${postId}/comments?page=${page}&limit=10`);

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data: CommentResponse = await response.json();
      
      if (append) {
        setComments(prev => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('載入評論失敗，請稍後再試。');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setComments([]);
    setCurrentPage(1);
    setTotalPages(1);
    fetchComments(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchComments(currentPage + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse text-gray-500">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">
        {comments.length} 則評論
      </h2>

      <CommentForm />

      <div className="mt-8">
        <CommentList comments={comments} />
      </div>

      {currentPage < totalPages && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? '載入中...' : '載入更多'}
          </button>
        </div>
      )}
    </div>
  );
}
