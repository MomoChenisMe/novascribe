import { BetaAnalyticsDataClient } from "@google-analytics/data";

interface GA4Stats {
  weeklyVisitors: number;
  monthlyPageViews: number;
}

let cachedStats: GA4Stats | null = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getClient(): BetaAnalyticsDataClient | null {
  if (!process.env.GA4_PROPERTY_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return null;
  }
  return new BetaAnalyticsDataClient();
}

export async function getGA4Stats(): Promise<GA4Stats> {
  // Return cache if fresh
  if (cachedStats && Date.now() - cachedAt < CACHE_TTL) {
    return cachedStats;
  }

  const client = getClient();
  if (!client) {
    return { weeklyVisitors: 0, monthlyPageViews: 0 };
  }

  const propertyId = process.env.GA4_PROPERTY_ID!;

  try {
    const [weeklyResponse, monthlyResponse] = await Promise.all([
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "activeUsers" }],
      }),
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [{ name: "screenPageViews" }],
      }),
    ]);

    const weeklyVisitors = Number(
      weeklyResponse[0]?.rows?.[0]?.metricValues?.[0]?.value ?? "0"
    );
    const monthlyPageViews = Number(
      monthlyResponse[0]?.rows?.[0]?.metricValues?.[0]?.value ?? "0"
    );

    cachedStats = { weeklyVisitors, monthlyPageViews };
    cachedAt = Date.now();

    return cachedStats;
  } catch (error) {
    console.error("GA4 API error:", error);
    return { weeklyVisitors: 0, monthlyPageViews: 0 };
  }
}
