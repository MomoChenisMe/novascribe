/**
 * @file 分頁查詢參數解析與回傳格式工具
 * @description 提供分頁相關的型別、參數解析、Prisma skip/take 計算、回應格式建立。
 *   - parsePaginationParams：從 URLSearchParams 解析分頁參數
 *   - getPrismaSkipTake：計算 Prisma 的 skip/take
 *   - createPaginatedResponse：建立標準分頁回應
 */

/**
 * 分頁參數
 */
export interface PaginationParams {
  page: number; // 1-based
  limit: number; // 每頁筆數
}

/**
 * 分頁元資料
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 分頁回應格式
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * 解析 query string 中的分頁參數
 * - 預設 page=1, limit=10
 * - 驗證 page >= 1, limit 在 1-100 之間
 */
export function parsePaginationParams(
  searchParams: URLSearchParams
): PaginationParams {
  const rawPage = searchParams.get('page');
  const rawLimit = searchParams.get('limit');

  let page = rawPage ? Math.floor(Number(rawPage)) : 1;
  let limit = rawLimit ? Math.floor(Number(rawLimit)) : 10;

  // 非數字或 NaN → 使用預設值
  if (isNaN(page)) page = 1;
  if (isNaN(limit)) limit = 10;

  // 邊界值修正
  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  return { page, limit };
}

/**
 * 計算 Prisma skip/take
 */
export function getPrismaSkipTake(params: PaginationParams): {
  skip: number;
  take: number;
} {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  };
}

/**
 * 建立分頁回應
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = total === 0 ? 0 : Math.ceil(total / params.limit);

  return {
    data,
    meta: {
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}
