import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function createArticleVersion(
  articleId: string,
  authorId: string,
  title: string,
  content: string,
  metadata?: Record<string, unknown>
) {
  const lastVersion = await prisma.articleVersion.findFirst({
    where: { articleId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });

  const versionNumber = (lastVersion?.versionNumber ?? 0) + 1;

  return prisma.articleVersion.create({
    data: {
      articleId,
      authorId,
      versionNumber,
      title,
      content,
      metadata: (metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function getArticleVersions(articleId: string) {
  return prisma.articleVersion.findMany({
    where: { articleId },
    orderBy: { versionNumber: "desc" },
    include: {
      author: { select: { name: true } },
    },
  });
}

export async function restoreArticleVersion(
  articleId: string,
  versionId: string,
  authorId: string
) {
  const version = await prisma.articleVersion.findUnique({
    where: { id: versionId },
  });

  if (!version || version.articleId !== articleId) {
    throw new Error("Version not found");
  }

  // Create a new version snapshot before restoring
  const current = await prisma.article.findUnique({
    where: { id: articleId },
    select: { title: true, content: true },
  });

  if (current) {
    await createArticleVersion(
      articleId,
      authorId,
      current.title,
      current.content,
      { restoredBefore: true }
    );
  }

  // Update the article with the version's content
  await prisma.article.update({
    where: { id: articleId },
    data: {
      title: version.title,
      content: version.content,
    },
  });

  // Create another version snapshot marking the restore
  return createArticleVersion(
    articleId,
    authorId,
    version.title,
    version.content,
    { restoredFrom: versionId, versionNumber: version.versionNumber }
  );
}
