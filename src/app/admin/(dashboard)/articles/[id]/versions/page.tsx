import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

export default async function ArticleVersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!article) notFound();

  const versions = await prisma.articleVersion.findMany({
    where: { articleId: id },
    orderBy: { versionNumber: "desc" },
    include: {
      author: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/articles/${id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">版本歷史</h1>
          <p className="text-sm text-muted-foreground">{article.title}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>版本</TableHead>
            <TableHead>標題</TableHead>
            <TableHead>作者</TableHead>
            <TableHead>建立時間</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                尚無版本紀錄
              </TableCell>
            </TableRow>
          ) : (
            versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell className="font-mono">
                  v{version.versionNumber}
                </TableCell>
                <TableCell>{version.title}</TableCell>
                <TableCell>{version.author.name}</TableCell>
                <TableCell>
                  {new Date(version.createdAt).toLocaleString("zh-TW")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
