import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "草稿", variant: "secondary" },
  published: { label: "已發布", variant: "default" },
  scheduled: { label: "排程", variant: "outline" },
  archived: { label: "已下架", variant: "destructive" },
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  await requireAuth();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { deletedAt: null };
  if (params.status) where.status = params.status;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="mr-2 size-4" />
            新增文章
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>標題</TableHead>
            <TableHead>作者</TableHead>
            <TableHead>分類</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead>建立時間</TableHead>
            <TableHead className="w-20">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                尚無文章
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => {
              const status = statusLabels[article.status] ?? statusLabels.draft;
              return (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.author.name}</TableCell>
                  <TableCell>{article.category?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(article.createdAt).toLocaleDateString("zh-TW")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/articles/${article.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link
                href={`/admin/articles?page=${p}${params.status ? `&status=${params.status}` : ""}${params.search ? `&search=${params.search}` : ""}`}
              >
                {p}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
