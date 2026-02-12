/**
 * @file GA4 Data API 服務層
 * @description 使用 @google-analytics/data 套件連接 GA4 Data API
 *   - 取得概覽數據（瀏覽量、使用者、工作階段、跳出率）
 *   - API 錯誤處理
 *   - 未設定時回傳空值
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';

export interface AnalyticsOverview {
  pageViews: number;
  users: number;
  sessions: number;
  bounceRate: number;
  /** 與前期相比的變化百分比 */
  pageViewsChange: number;
  usersChange: number;
  sessionsChange: number;
  bounceRateChange: number;
}

export interface GA4Config {
  propertyId: string;
  credentials?: string; // JSON string of service account credentials
}

/**
 * 建立 GA4 Data API 客戶端
 */
function createClient(config: GA4Config): BetaAnalyticsDataClient {
  const options: Record<string, unknown> = {};

  if (config.credentials) {
    try {
      options.credentials = JSON.parse(config.credentials);
    } catch {
      throw new Error('Invalid service account credentials JSON');
    }
  }

  return new BetaAnalyticsDataClient(options);
}

/**
 * 計算變化百分比
 */
function calcChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * 取得 GA4 概覽數據
 * @param config GA4 設定
 * @param days 天數範圍（預設 30 天）
 */
export async function getAnalyticsOverview(
  config: GA4Config,
  days: number = 30
): Promise<AnalyticsOverview> {
  if (!config.propertyId) {
    throw new Error('GA4 Property ID is not configured');
  }

  const client = createClient(config);

  const endDate = 'today';
  const startDate = `${days}daysAgo`;
  const prevStartDate = `${days * 2}daysAgo`;
  const prevEndDate = `${days + 1}daysAgo`;

  try {
    // 當前期間數據
    const [currentResponse] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
      ],
    });

    // 前期數據（比較用）
    const [previousResponse] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate: prevStartDate, endDate: prevEndDate }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
      ],
    });

    const currentRow = currentResponse.rows?.[0];
    const previousRow = previousResponse.rows?.[0];

    const current = {
      pageViews: parseInt(currentRow?.metricValues?.[0]?.value || '0', 10),
      users: parseInt(currentRow?.metricValues?.[1]?.value || '0', 10),
      sessions: parseInt(currentRow?.metricValues?.[2]?.value || '0', 10),
      bounceRate: parseFloat(currentRow?.metricValues?.[3]?.value || '0'),
    };

    const previous = {
      pageViews: parseInt(previousRow?.metricValues?.[0]?.value || '0', 10),
      users: parseInt(previousRow?.metricValues?.[1]?.value || '0', 10),
      sessions: parseInt(previousRow?.metricValues?.[2]?.value || '0', 10),
      bounceRate: parseFloat(previousRow?.metricValues?.[3]?.value || '0'),
    };

    return {
      ...current,
      pageViewsChange: calcChange(current.pageViews, previous.pageViews),
      usersChange: calcChange(current.users, previous.users),
      sessionsChange: calcChange(current.sessions, previous.sessions),
      bounceRateChange: calcChange(current.bounceRate, previous.bounceRate),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`GA4 API error: ${error.message}`);
    }
    throw new Error('GA4 API error: Unknown error');
  }
}
