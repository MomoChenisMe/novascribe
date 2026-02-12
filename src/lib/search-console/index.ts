/**
 * @file Google Search Console API 服務層
 * @description 使用 googleapis 套件連接 Search Console API
 *   - 取得效能數據（曝光、點擊、CTR、排名）
 *   - 依維度分組（query/page/country/device）
 *   - API 錯誤處理
 */

import { google } from 'googleapis';

export interface SearchPerformanceRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPerformanceResult {
  rows: SearchPerformanceRow[];
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
}

export type SearchDimension = 'query' | 'page' | 'country' | 'device' | 'date';

export interface SearchPerformanceOptions {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: SearchDimension[];
  rowLimit?: number;
}

export interface SearchConsoleConfig {
  credentials?: string; // JSON string of service account credentials
}

/**
 * 建立 Search Console API 客戶端
 */
function createAuth(config: SearchConsoleConfig) {
  const options: Record<string, unknown> = {
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  };

  if (config.credentials) {
    try {
      options.credentials = JSON.parse(config.credentials);
    } catch {
      throw new Error('Invalid service account credentials JSON');
    }
  }

  return new google.auth.GoogleAuth(options);
}

/**
 * 取得搜尋效能數據
 */
export async function getSearchPerformance(
  options: SearchPerformanceOptions,
  config: SearchConsoleConfig = {}
): Promise<SearchPerformanceResult> {
  if (!options.siteUrl) {
    throw new Error('Search Console site URL is not configured');
  }

  const auth = createAuth(config);
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl: options.siteUrl,
      requestBody: {
        startDate: options.startDate,
        endDate: options.endDate,
        dimensions: options.dimensions || ['query'],
        rowLimit: options.rowLimit || 25,
      },
    });

    const rows: SearchPerformanceRow[] = (response.data.rows || []).map(
      (row) => ({
        keys: row.keys || [],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      })
    );

    // Calculate totals
    const totals = rows.reduce(
      (acc, row) => ({
        clicks: acc.clicks + row.clicks,
        impressions: acc.impressions + row.impressions,
        ctr: 0, // Will be calculated
        position: 0, // Will be calculated
      }),
      { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    );

    if (totals.impressions > 0) {
      totals.ctr = totals.clicks / totals.impressions;
    }

    if (rows.length > 0) {
      totals.position =
        rows.reduce((sum, r) => sum + r.position, 0) / rows.length;
    }

    return { rows, totals };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Search Console API error: ${error.message}`);
    }
    throw new Error('Search Console API error: Unknown error');
  }
}
