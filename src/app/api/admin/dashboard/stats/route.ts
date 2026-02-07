import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalArticles, draftArticles, publishedArticles, totalImages] =
    await Promise.all([
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.article.count({
        where: { status: "draft", deletedAt: null },
      }),
      prisma.article.count({
        where: { status: "published", deletedAt: null },
      }),
      prisma.image.count(),
    ]);

  // GA4 data would be fetched here if configured
  // For now, return placeholder values
  return NextResponse.json({
    totalArticles,
    draftArticles,
    publishedArticles,
    totalImages,
    weeklyVisitors: 0,
    monthlyPageViews: 0,
    lastUpdated: new Date().toISOString(),
  });
}
