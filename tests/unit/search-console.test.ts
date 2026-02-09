/**
 * @file Search Console API 服務層單元測試
 * @description 測試 Search Console API 服務
 *   - 取得效能數據
 *   - 依維度分組
 *   - API 錯誤處理
 *
 * @jest-environment node
 */

// Mock googleapis
const mockQuery = jest.fn();
jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => ({})),
    },
    searchconsole: jest.fn().mockImplementation(() => ({
      searchanalytics: {
        query: mockQuery,
      },
    })),
  },
}));

import { getSearchPerformance } from '@/lib/search-console';

describe('getSearchPerformance', () => {
  beforeEach(() => {
    mockQuery.mockClear();
  });

  it('應回傳效能數據', async () => {
    mockQuery.mockResolvedValue({
      data: {
        rows: [
          {
            keys: ['nextjs blog'],
            clicks: 100,
            impressions: 1000,
            ctr: 0.1,
            position: 5.5,
          },
          {
            keys: ['react tutorial'],
            clicks: 50,
            impressions: 500,
            ctr: 0.1,
            position: 8.2,
          },
        ],
      },
    });

    const result = await getSearchPerformance({
      siteUrl: 'https://example.com',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].keys).toEqual(['nextjs blog']);
    expect(result.rows[0].clicks).toBe(100);
    expect(result.totals.clicks).toBe(150);
    expect(result.totals.impressions).toBe(1500);
  });

  it('應計算正確的總計 CTR', async () => {
    mockQuery.mockResolvedValue({
      data: {
        rows: [
          { keys: ['a'], clicks: 10, impressions: 100, ctr: 0.1, position: 3 },
          { keys: ['b'], clicks: 20, impressions: 200, ctr: 0.1, position: 5 },
        ],
      },
    });

    const result = await getSearchPerformance({
      siteUrl: 'https://example.com',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.totals.ctr).toBe(0.1); // 30/300
    expect(result.totals.position).toBe(4); // (3+5)/2
  });

  it('依維度分組（page）', async () => {
    mockQuery.mockResolvedValue({
      data: {
        rows: [
          { keys: ['/posts/hello'], clicks: 30, impressions: 300, ctr: 0.1, position: 4 },
        ],
      },
    });

    const result = await getSearchPerformance({
      siteUrl: 'https://example.com',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      dimensions: ['page'],
    });

    expect(result.rows[0].keys).toEqual(['/posts/hello']);

    // Verify dimension was passed
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          dimensions: ['page'],
        }),
      })
    );
  });

  it('無數據時應回傳空列', async () => {
    mockQuery.mockResolvedValue({
      data: { rows: undefined },
    });

    const result = await getSearchPerformance({
      siteUrl: 'https://example.com',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    expect(result.rows).toHaveLength(0);
    expect(result.totals.clicks).toBe(0);
    expect(result.totals.impressions).toBe(0);
  });

  it('site URL 未設定時應拋出錯誤', async () => {
    await expect(
      getSearchPerformance({
        siteUrl: '',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })
    ).rejects.toThrow('Search Console site URL is not configured');
  });

  it('API 錯誤時應拋出錯誤', async () => {
    mockQuery.mockRejectedValue(new Error('Forbidden'));

    await expect(
      getSearchPerformance({
        siteUrl: 'https://example.com',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      })
    ).rejects.toThrow('Search Console API error: Forbidden');
  });
});
