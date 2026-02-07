import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ImageIcon, Eye, FileEdit } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  await requireAuth();

  const [totalArticles, draftArticles, publishedArticles, totalImages, recentArticles] =
    await Promise.all([
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.article.count({
        where: { status: "draft", deletedAt: null },
      }),
      prisma.article.count({
        where: { status: "published", deletedAt: null },
      }),
      prisma.image.count(),
      prisma.article.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  const stats = [
    {
      title: "總文章數",
      value: totalArticles,
      icon: FileText,
      href: "/admin/articles",
    },
    {
      title: "已發布",
      value: publishedArticles,
      icon: Eye,
      href: "/admin/articles?status=published",
    },
    {
      title: "草稿",
      value: draftArticles,
      icon: FileEdit,
      href: "/admin/articles?status=draft",
    },
    {
      title: "圖片數量",
      value: totalImages,
      icon: ImageIcon,
      href: "/admin/images",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">儀表板</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近文章</CardTitle>
        </CardHeader>
        <CardContent>
          {recentArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">尚無文章</p>
          ) : (
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}`}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(article.createdAt).toLocaleDateString("zh-TW")}
                    </p>
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">
                    {article.status === "draft" ? "草稿" : "已發布"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
