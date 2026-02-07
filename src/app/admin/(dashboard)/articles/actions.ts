"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/auth-utils";
import { generateSlug, ensureUniqueSlug } from "@/lib/articles";
import {
  createArticleSchema,
  updateArticleSchema,
} from "@/lib/validations/article";
import { revalidatePath } from "next/cache";
import { createArticleVersion } from "@/lib/versions";

export async function getArticles(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}) {
  await requireAuth();

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (params.status) {
    where.status = params.status;
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { content: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> = {};
  orderBy[params.sort ?? "createdAt"] = params.order ?? "desc";

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, page, limit };
}

export async function createArticle(data: unknown) {
  const session = await requireRole(["admin", "editor"]);
  const parsed = createArticleSchema.parse(data);

  const baseSlug = generateSlug(parsed.title);
  const slug = await ensureUniqueSlug(prisma, baseSlug);

  const article = await prisma.article.create({
    data: {
      ...parsed,
      slug,
      authorId: session.user.id,
      publishedAt: parsed.status === "published" ? new Date() : null,
    },
  });

  // Create initial version snapshot
  await createArticleVersion(
    article.id,
    session.user.id,
    parsed.title,
    parsed.content
  );

  revalidatePath("/admin/articles");
  return article;
}

export async function updateArticle(id: string, data: unknown) {
  const session = await requireRole(["admin", "editor"]);
  const parsed = updateArticleSchema.parse(data);

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) throw new Error("Article not found");

  let slug = existing.slug;
  if (parsed.title && parsed.title !== existing.title) {
    const baseSlug = generateSlug(parsed.title);
    slug = await ensureUniqueSlug(prisma, baseSlug);
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...parsed,
      slug,
      publishedAt:
        parsed.status === "published" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    },
  });

  // Create version snapshot on update
  await createArticleVersion(
    article.id,
    session.user.id,
    article.title,
    article.content
  );

  revalidatePath("/admin/articles");
  return article;
}

export async function deleteArticle(id: string) {
  await requireRole(["admin"]);

  await prisma.article.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/admin/articles");
}

export async function restoreArticle(id: string) {
  await requireRole(["admin"]);

  await prisma.article.update({
    where: { id },
    data: { deletedAt: null },
  });

  revalidatePath("/admin/articles");
}

export async function publishArticle(id: string) {
  await requireRole(["admin", "editor"]);

  await prisma.article.update({
    where: { id },
    data: {
      status: "published",
      publishedAt: new Date(),
    },
  });

  revalidatePath("/admin/articles");
}
