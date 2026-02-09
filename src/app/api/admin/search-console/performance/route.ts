/**
 * @file Search Console 效能 API Route Handler
 * @description GET /api/admin/search-console/performance
 *   - 取得搜尋效能數據
 *   - 需認證
 *   - 支援 dimension query 參數
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSearchPerformance, type SearchDimension } from '@/lib/search-console';

const VALID_DIMENSIONS: SearchDimension[] = ['query', 'page', 'country', 'device', 'date'];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) {
    return NextResponse.json(
      {
        success: false,
        error: 'Search Console site URL is not configured',
        configured: false,
      },
      { status: 200 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get('days') || '28', 10);
  const dimensionParam = searchParams.get('dimension') || 'query';
  const rowLimit = parseInt(searchParams.get('limit') || '25', 10);

  // Validate dimension
  const dimension = VALID_DIMENSIONS.includes(dimensionParam as SearchDimension)
    ? (dimensionParam as SearchDimension)
    : 'query';

  // Calculate dates
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3); // GSC data has ~3 day delay
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  try {
    const result = await getSearchPerformance(
      {
        siteUrl,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: [dimension],
        rowLimit,
      },
      {
        credentials: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
      configured: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        configured: true,
      },
      { status: 500 }
    );
  }
}
