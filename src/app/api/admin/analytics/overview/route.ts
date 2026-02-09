/**
 * @file GA4 概覽 API Route Handler
 * @description GET /api/admin/analytics/overview
 *   - 取得 GA4 流量概覽數據
 *   - 需認證
 *   - GA4 未設定時回傳提示
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAnalyticsOverview } from '@/lib/analytics/ga4-data';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    return NextResponse.json(
      {
        success: false,
        error: 'GA4 Property ID is not configured',
        configured: false,
      },
      { status: 200 }
    );
  }

  const days = parseInt(
    request.nextUrl.searchParams.get('days') || '30',
    10
  );

  try {
    const overview = await getAnalyticsOverview(
      {
        propertyId,
        credentials: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      },
      days
    );

    return NextResponse.json({
      success: true,
      data: overview,
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
