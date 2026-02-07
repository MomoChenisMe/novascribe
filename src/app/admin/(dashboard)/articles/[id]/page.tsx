import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth-utils";
import { ArticleForm } from "@/components/admin/article-form";
import { notFound } from "next/navigation";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin", "editor"]);
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      excerpt: true,
      categoryId: true,
      tags: true,
      status: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  if (!article) notFound();

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">編輯文章</h1>
      <ArticleForm
        article={{
          ...article,
          excerpt: article.excerpt ?? "",
          metaTitle: article.metaTitle ?? "",
          metaDescription: article.metaDescription ?? "",
        }}
        categories={categories}
      />
    </div>
  );
}
