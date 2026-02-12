/**
 * @file 分頁工具函式測試
 * @description 測試分頁參數解析、offset 計算、回傳格式
 *   - parsePaginationParams：預設值、邊界值、無效輸入
 *   - getPrismaSkipTake：skip/take 計算
 *   - createPaginatedResponse：分頁回應格式與元資料
 */

import {
  parsePaginationParams,
  getPrismaSkipTake,
  createPaginatedResponse,
  type PaginationParams,
} from '@/lib/pagination';

describe('parsePaginationParams', () => {
  it('無參數時應使用預設值 page=1, limit=10', () => {
    const params = new URLSearchParams();
    const result = parsePaginationParams(params);
    expect(result).toEqual({ page: 1, limit: 10 });
  });

  it('應正確解析 page 和 limit', () => {
    const params = new URLSearchParams({ page: '3', limit: '20' });
    const result = parsePaginationParams(params);
    expect(result).toEqual({ page: 3, limit: 20 });
  });

  it('page=0 應修正為 1', () => {
    const params = new URLSearchParams({ page: '0' });
    const result = parsePaginationParams(params);
    expect(result.page).toBe(1);
  });

  it('page 為負數應修正為 1', () => {
    const params = new URLSearchParams({ page: '-5' });
    const result = parsePaginationParams(params);
    expect(result.page).toBe(1);
  });

  it('limit=0 應修正為 1', () => {
    const params = new URLSearchParams({ limit: '0' });
    const result = parsePaginationParams(params);
    expect(result.limit).toBe(1);
  });

  it('limit 為負數應修正為 1', () => {
    const params = new URLSearchParams({ limit: '-10' });
    const result = parsePaginationParams(params);
    expect(result.limit).toBe(1);
  });

  it('limit 超過 100 應修正為 100', () => {
    const params = new URLSearchParams({ limit: '999' });
    const result = parsePaginationParams(params);
    expect(result.limit).toBe(100);
  });

  it('limit=100 應保持為 100', () => {
    const params = new URLSearchParams({ limit: '100' });
    const result = parsePaginationParams(params);
    expect(result.limit).toBe(100);
  });

  it('limit=1 應保持為 1', () => {
    const params = new URLSearchParams({ limit: '1' });
    const result = parsePaginationParams(params);
    expect(result.limit).toBe(1);
  });

  it('非數字的 page 應使用預設值', () => {
    const params = new URLSearchParams({ page: 'abc' });
    const result = parsePaginationParams(params);
    expect(result.page).toBe(1);
  });

  it('非數字的 limit 應使用預設值', () => {
    const params = new URLSearchParams({ limit: 'abc' });
    const result = parsePaginationParams(params);
    expect(result.limit).toBe(10);
  });

  it('浮點數的 page 應取整數', () => {
    const params = new URLSearchParams({ page: '2.7' });
    const result = parsePaginationParams(params);
    expect(result.page).toBe(2);
  });

  it('浮點數的 limit 應取整數', () => {
    const params = new URLSearchParams({ limit: '15.9' });
    const result = parsePaginationParams(params);
    expect(result.limit).toBe(15);
  });
});

describe('getPrismaSkipTake', () => {
  it('page=1, limit=10 → skip=0, take=10', () => {
    const result = getPrismaSkipTake({ page: 1, limit: 10 });
    expect(result).toEqual({ skip: 0, take: 10 });
  });

  it('page=2, limit=10 → skip=10, take=10', () => {
    const result = getPrismaSkipTake({ page: 2, limit: 10 });
    expect(result).toEqual({ skip: 10, take: 10 });
  });

  it('page=3, limit=20 → skip=40, take=20', () => {
    const result = getPrismaSkipTake({ page: 3, limit: 20 });
    expect(result).toEqual({ skip: 40, take: 20 });
  });

  it('page=1, limit=1 → skip=0, take=1', () => {
    const result = getPrismaSkipTake({ page: 1, limit: 1 });
    expect(result).toEqual({ skip: 0, take: 1 });
  });

  it('page=5, limit=50 → skip=200, take=50', () => {
    const result = getPrismaSkipTake({ page: 5, limit: 50 });
    expect(result).toEqual({ skip: 200, take: 50 });
  });
});

describe('createPaginatedResponse', () => {
  const sampleData = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ];

  it('應建立正確的分頁回應格式', () => {
    const result = createPaginatedResponse(sampleData, 50, { page: 1, limit: 10 });
    expect(result).toEqual({
      data: sampleData,
      meta: {
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      },
    });
  });

  it('最後一頁應 hasNext=false', () => {
    const result = createPaginatedResponse(sampleData, 50, { page: 5, limit: 10 });
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.hasPrev).toBe(true);
  });

  it('中間頁應 hasNext=true, hasPrev=true', () => {
    const result = createPaginatedResponse(sampleData, 50, { page: 3, limit: 10 });
    expect(result.meta.hasNext).toBe(true);
    expect(result.meta.hasPrev).toBe(true);
  });

  it('只有一頁時 hasNext=false, hasPrev=false', () => {
    const result = createPaginatedResponse(sampleData, 2, { page: 1, limit: 10 });
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.hasPrev).toBe(false);
    expect(result.meta.totalPages).toBe(1);
  });

  it('total=0 時 totalPages=0', () => {
    const result = createPaginatedResponse([], 0, { page: 1, limit: 10 });
    expect(result.meta.totalPages).toBe(0);
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.hasPrev).toBe(false);
    expect(result.data).toEqual([]);
  });

  it('totalPages 應正確進位（total=11, limit=10 → 2 頁）', () => {
    const result = createPaginatedResponse(sampleData, 11, { page: 1, limit: 10 });
    expect(result.meta.totalPages).toBe(2);
    expect(result.meta.hasNext).toBe(true);
  });

  it('total=10, limit=10 → 1 頁', () => {
    const result = createPaginatedResponse(sampleData, 10, { page: 1, limit: 10 });
    expect(result.meta.totalPages).toBe(1);
    expect(result.meta.hasNext).toBe(false);
  });
});
