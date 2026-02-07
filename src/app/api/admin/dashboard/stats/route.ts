import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGA4Stats } from "@/lib/ga4";
import { checkContentHealth } from "@/lib/content-health";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalArticles, draftArticles, publishedArticles, totalImages, ga4Stats, articles] =
    await Promise.all([
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.article.count({
        where: { status: "draft", deletedAt: null },
      }),
      prisma.article.count({
        where: { status: "published", deletedAt: null },
      }),
      prisma.image.count(),
      getGA4Stats(),
      prisma.article.findMany({
        where: { status: "published", deletedAt: null },
        select: {
          title: true,
          content: true,
          metaTitle: true,
          metaDescription: true,
          ogImage: true,
        },
      }),
    ]);

  // Calculate average content health score
  let contentHealthScore = 0;
  if (articles.length > 0) {
    const totalScore = articles.reduce((sum, article) => {
      const health = checkContentHealth(article);
      return sum + health.score;
    }, 0);
    contentHealthScore = Math.round(totalScore / articles.length);
  }

  return NextResponse.json({
    totalArticles,
    draftArticles,
    publishedArticles,
    totalImages,
    weeklyVisitors: ga4Stats.weeklyVisitors,
    monthlyPageViews: ga4Stats.monthlyPageViews,
    contentHealthScore,
    lastUpdated: new Date().toISOString(),
  });
}
