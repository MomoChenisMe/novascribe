/**
 * @file 文章匯入 Service 層
 * @description 從 Markdown + front matter 匯入文章
 *   - 使用 gray-matter 解析 front matter
 *   - 分類/標籤自動匹配（name/slug），不存在則建立
 *   - 自動建立第一個版本
 *   - slug 去重
 */

import { prisma } from '@/lib/prisma';
import { generateSlug, ensureUniqueSlug } from '@/lib/slug';
import type { Post } from '@/generated/prisma/client';
import matter from 'gray-matter';

/**
 * 從 Markdown + front matter 匯入文章
 * @param markdown Markdown 字串（含 YAML front matter）
 * @param authorId 作者 ID
 * @returns 建立的文章
 * @throws 當 title 缺少時拋出錯誤
 */
export async function importPost(
  markdown: string,
  authorId: string
): Promise<Post> {
  // 解析 front matter
  const { data: frontMatter, content } = matter(markdown);

  // 驗證必填欄位
  if (!frontMatter.title) {
    throw new Error('Missing required field: title');
  }

  // 生成或使用提供的 slug
  let slug = frontMatter.slug || generateSlug(frontMatter.title);

  // slug 去重
  slug = await ensureUniqueSlug(slug, async (candidate: string) => {
    const existing = await prisma.post.findUnique({
      where: { slug: candidate },
    });
    return existing !== null;
  });

  // 在 transaction 中處理所有操作
  return prisma.$transaction(async (tx) => {
    // 處理分類
    let categoryId: string | null = null;
    if (frontMatter.category) {
      const categoryName = String(frontMatter.category);
      const categorySlug = generateSlug(categoryName);

      // 用 name 或 slug 匹配
      let category = await tx.category.findFirst({
        where: {
          OR: [{ name: categoryName }, { slug: categorySlug }],
        },
      });

      // 不存在則建立
      if (!category) {
        category = await tx.category.create({
          data: { name: categoryName, slug: categorySlug },
        });
      }

      categoryId = category.id;
    }

    // 處理標籤
    const tagIds: string[] = [];
    if (frontMatter.tags && Array.isArray(frontMatter.tags)) {
      for (const tagName of frontMatter.tags) {
        const name = String(tagName);
        const tagSlug = generateSlug(name);

        // 用 name 或 slug 匹配
        let tag = await tx.tag.findFirst({
          where: {
            OR: [{ name }, { slug: tagSlug }],
          },
        });

        // 不存在則建立
        if (!tag) {
          tag = await tx.tag.create({
            data: { name, slug: tagSlug },
          });
        }

        tagIds.push(tag.id);
      }
    }

    // 處理狀態
    const status = frontMatter.status || 'DRAFT';

    // 處理發佈日期
    const publishedAt = frontMatter.date
      ? new Date(frontMatter.date)
      : null;

    // 建立文章
    const trimmedContent = content.trim();
    const post = await tx.post.create({
      data: {
        title: frontMatter.title,
        slug,
        content: trimmedContent,
        excerpt: frontMatter.excerpt || null,
        coverImage: frontMatter.coverImage || null,
        status,
        publishedAt,
        authorId,
        categoryId,
      },
    });

    // 建立第一個版本
    await tx.postVersion.create({
      data: {
        postId: post.id,
        title: frontMatter.title,
        content: trimmedContent,
        version: 1,
      },
    });

    // 建立標籤關聯
    if (tagIds.length > 0) {
      await tx.postTag.createMany({
        data: tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        })),
      });
    }

    return post;
  });
}
