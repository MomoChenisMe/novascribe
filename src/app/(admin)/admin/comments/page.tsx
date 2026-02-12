/**
 * @file 評論管理頁面
 * @description 後台評論管理頁面（Server Component）
 *   - 需認證（使用 getServerSession，未登入 redirect）
 *   - 從 /api/admin/comments 載入評論列表
 *   - 狀態篩選 tabs：全部、待審核、已核准、Spam、已刪除
 *   - 統計卡片：待審核數、今日新增數、已核准總數、Spam 總數
 *   - 評論列表表格：作者、內容（前 50 字）、文章標題、狀態、時間、操作按鈕
 *   - 分頁：page、limit（預設 20）
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import CommentsTable from './components/CommentsTable';
import StatusTabs from './components/StatusTabs';
import StatsCards from './components/StatsCards';
import Pagination from './components/Pagination';

interface CommentsPageProps {
  searchParams: {
    status?: string;
    page?: string;
    limit?: string;
  };
}

/** 評論統計資料 */
interface CommentStats {
  pending: number;
  todayNew: number;
  approved: number;
  spam: number;
}

/** 評論資料 */
interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
  };
}

/** 分頁資料 */
interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** 預設統計值 */
const DEFAULT_STATS: CommentStats = {
  pending: 0,
  todayNew: 0,
  approved: 0,
  spam: 0,
};

/** 預設分頁資料 */
const DEFAULT_PAGINATION: PaginationData = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

/**
 * 取得統計資料
 */
async function fetchStats(): Promise<CommentStats> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/admin/comments/stats`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch stats:', res.status);
      return DEFAULT_STATS;
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return DEFAULT_STATS;
  }
}

/**
 * 取得評論列表
 */
async function fetchComments(
  status?: string,
  page: number = 1,
  limit: number = 20
): Promise<{ comments: Comment[]; pagination: PaginationData }> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status) {
      params.set('status', status);
    }

    const res = await fetch(`${baseUrl}/api/admin/comments?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch comments:', res.status);
      return {
        comments: [],
        pagination: DEFAULT_PAGINATION,
      };
    }

    const data = await res.json();

    return {
      comments: data.comments || [],
      pagination: {
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 20,
        totalPages: data.totalPages || 0,
      },
    };
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return {
      comments: [],
      pagination: DEFAULT_PAGINATION,
    };
  }
}

/**
 * 評論管理頁面
 */
export default async function CommentsPage({ searchParams }: CommentsPageProps) {
  // 認證檢查
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/api/auth/signin');
  }

  // 解析參數
  const status = searchParams.status;
  const page = parseInt(searchParams.page || '1', 10) || 1;
  const limit = parseInt(searchParams.limit || '20', 10) || 20;

  // 並行載入資料
  const [stats, { comments, pagination }] = await Promise.all([
    fetchStats(),
    fetchComments(status, page, limit),
  ]);

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">評論管理</h1>
      </div>

      {/* 統計卡片 */}
      <StatsCards stats={stats} />

      {/* 狀態篩選 tabs */}
      <StatusTabs currentStatus={status} />

      {/* 評論列表表格 */}
      <CommentsTable comments={comments} />

      {/* 分頁控制 */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          status={status}
        />
      )}
    </div>
  );
}
