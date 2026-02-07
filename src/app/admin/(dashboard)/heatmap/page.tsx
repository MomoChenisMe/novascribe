import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function HeatmapPage() {
  await requireAuth();

  const articles = await prisma.article.findMany({
    where: { deletedAt: null, status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      publishedAt: true,
      _count: { select: { heatmapEvents: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">互動熱圖</h1>
      <p className="text-muted-foreground">
        選擇一篇文章查看讀者互動數據
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.id} href={`/admin/heatmap/${article.id}`}>
            <Card className="transition-colors hover:bg-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("zh-TW")
                      : "—"}
                  </span>
                  <span>{article._count.heatmapEvents} 筆事件</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {articles.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            尚無已發布的文章
          </p>
        )}
      </div>
    </div>
  );
}
