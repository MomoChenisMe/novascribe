/**
 * @file GA4 Data API 服務層單元測試
 * @description 測試 GA4 Data API 服務
 *   - 取得概覽數據
 *   - API 錯誤處理
 *   - 未設定時的回應
 *
 * @jest-environment node
 */

// Mock @google-analytics/data
const mockRunReport = jest.fn();
jest.mock('@google-analytics/data', () => ({
  BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({
    runReport: mockRunReport,
  })),
}));

import { getAnalyticsOverview } from '@/lib/analytics/ga4-data';

describe('getAnalyticsOverview', () => {
  beforeEach(() => {
    mockRunReport.mockClear();
  });

  it('應回傳概覽數據', async () => {
    mockRunReport
      .mockResolvedValueOnce([{
        rows: [{
          metricValues: [
            { value: '1000' },  // pageViews
            { value: '500' },   // users
            { value: '600' },   // sessions
            { value: '45.5' },  // bounceRate
          ],
        }],
      }])
      .mockResolvedValueOnce([{
        rows: [{
          metricValues: [
            { value: '800' },   // prev pageViews
            { value: '400' },   // prev users
            { value: '500' },   // prev sessions
            { value: '50.0' },  // prev bounceRate
          ],
        }],
      }]);

    const result = await getAnalyticsOverview({ propertyId: '123456' });

    expect(result.pageViews).toBe(1000);
    expect(result.users).toBe(500);
    expect(result.sessions).toBe(600);
    expect(result.bounceRate).toBe(45.5);
    expect(result.pageViewsChange).toBe(25);
    expect(result.usersChange).toBe(25);
    expect(result.sessionsChange).toBe(20);
  });

  it('前期數據為零時應計算正確的變化百分比', async () => {
    mockRunReport
      .mockResolvedValueOnce([{
        rows: [{
          metricValues: [
            { value: '100' },
            { value: '50' },
            { value: '60' },
            { value: '30' },
          ],
        }],
      }])
      .mockResolvedValueOnce([{
        rows: [{
          metricValues: [
            { value: '0' },
            { value: '0' },
            { value: '0' },
            { value: '0' },
          ],
        }],
      }]);

    const result = await getAnalyticsOverview({ propertyId: '123456' });

    expect(result.pageViewsChange).toBe(100);
    expect(result.usersChange).toBe(100);
  });

  it('無數據列時應回傳零值', async () => {
    mockRunReport
      .mockResolvedValueOnce([{ rows: [] }])
      .mockResolvedValueOnce([{ rows: [] }]);

    const result = await getAnalyticsOverview({ propertyId: '123456' });

    expect(result.pageViews).toBe(0);
    expect(result.users).toBe(0);
    expect(result.sessions).toBe(0);
    expect(result.bounceRate).toBe(0);
  });

  it('Property ID 未設定時應拋出錯誤', async () => {
    await expect(
      getAnalyticsOverview({ propertyId: '' })
    ).rejects.toThrow('GA4 Property ID is not configured');
  });

  it('API 錯誤時應拋出錯誤', async () => {
    mockRunReport.mockRejectedValue(new Error('Permission denied'));

    await expect(
      getAnalyticsOverview({ propertyId: '123456' })
    ).rejects.toThrow('GA4 API error: Permission denied');
  });

  it('應支援自訂天數範圍', async () => {
    mockRunReport
      .mockResolvedValueOnce([{ rows: [{ metricValues: [{ value: '10' }, { value: '5' }, { value: '6' }, { value: '40' }] }] }])
      .mockResolvedValueOnce([{ rows: [{ metricValues: [{ value: '8' }, { value: '4' }, { value: '5' }, { value: '45' }] }] }]);

    await getAnalyticsOverview({ propertyId: '123456' }, 7);

    expect(mockRunReport).toHaveBeenCalledTimes(2);
    // Check that the date ranges use 7 days
    const firstCall = mockRunReport.mock.calls[0][0];
    expect(firstCall.dateRanges[0].startDate).toBe('7daysAgo');
  });
});
