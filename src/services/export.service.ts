/**
 * @file 文章匯出 Service 層
 * @description 文章匯出邏輯
 *   - exportPost：單篇匯出 Markdown（含 YAML front matter）
 *   - exportPostsBatch：批次匯出為 ZIP（使用 jszip）
 */

import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';

/** 文章含關聯資料的型別 */
interface PostWithRelations {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
  publishedAt: Date | null;
  category: { name: string } | null;
  tags: Array<{ tag: { name: string } }>;
}

/**
 * 將文章轉為 Markdown 字串（含 YAML front matter）
 */
function postToMarkdown(post: PostWithRelations): string {
  const frontMatter: Record<string, unknown> = {};

  frontMatter.title = post.title;
  frontMatter.slug = post.slug;

  if (post.publishedAt) {
    frontMatter.date = post.publishedAt.toISOString();
  }

  if (post.excerpt) {
    frontMatter.excerpt = post.excerpt;
  }

  if (post.coverImage) {
    frontMatter.coverImage = post.coverImage;
  }

  if (post.category) {
    frontMatter.category = post.category.name;
  }

  if (post.tags && post.tags.length > 0) {
    frontMatter.tags = post.tags.map((t) => t.tag.name);
  }

  frontMatter.status = post.status;

  // 手動生成 YAML front matter（避免引入 yaml 套件）
  const yamlLines: string[] = [];
  for (const [key, value] of Object.entries(frontMatter)) {
    if (Array.isArray(value)) {
      yamlLines.push(`${key}:`);
      for (const item of value) {
        yamlLines.push(`  - "${item}"`);
      }
    } else {
      yamlLines.push(`${key}: "${value}"`);
    }
  }

  return `---\n${yamlLines.join('\n')}\n---\n\n${post.content}\n`;
}

/**
 * 匯出單篇文章為 Markdown（含 YAML front matter）
 * @param postId 文章 ID
 * @returns Markdown 字串
 * @throws 當文章不存在時拋出錯誤
 */
export async function exportPost(postId: string): Promise<string> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      category: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!post) {
    throw new Error(`Post "${postId}" not found`);
  }

  return postToMarkdown(post as unknown as PostWithRelations);
}

/**
 * 批次匯出文章為 ZIP
 * - 每篇文章一個 .md 檔案，以 slug 命名
 * - 重複 slug 加上 id 後綴
 * @param postIds 文章 ID 陣列
 * @returns ZIP Buffer
 */
export async function exportPostsBatch(postIds: string[]): Promise<Buffer> {
  const posts = await prisma.post.findMany({
    where: { id: { in: postIds } },
    include: {
      category: true,
      tags: {
        include: { tag: true },
      },
    },
  });

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const post of posts as unknown as PostWithRelations[]) {
    let filename = `${post.slug}.md`;

    // 處理重複檔名
    if (usedNames.has(filename)) {
      filename = `${post.slug}-${post.id}.md`;
    }

    usedNames.add(filename);
    zip.file(filename, postToMarkdown(post));
  }

  return zip.generateAsync({ type: 'nodebuffer' }) as Promise<Buffer>;
}
