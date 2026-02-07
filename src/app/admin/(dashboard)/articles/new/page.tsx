import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { ArticleForm } from "@/components/admin/article-form";

export default async function NewArticlePage() {
  await requireRole(["admin", "editor"]);

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">新增文章</h1>
      <ArticleForm categories={categories} />
    </div>
  );
}
