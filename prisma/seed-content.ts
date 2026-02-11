/**
 * @file 前台內容 Seed Script
 * @description 為 NovaScribe 前台建立初始內容（分類、標籤、文章、站點設定）
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('開始建立前台內容...');

  // 取得 admin 使用者
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@novascribe.local' },
  });

  if (!admin) {
    throw new Error('Admin 使用者不存在，請先執行主要 seed');
  }

  // 建立分類
  console.log('建立分類...');
  const techCategory = await prisma.category.upsert({
    where: { slug: 'tech' },
    update: {},
    create: {
      name: '技術',
      slug: 'tech',
      sortOrder: 1,
    },
  });

  const lifeCategory = await prisma.category.upsert({
    where: { slug: 'life' },
    update: {},
    create: {
      name: '生活',
      slug: 'life',
      sortOrder: 2,
    },
  });

  const noteCategory = await prisma.category.upsert({
    where: { slug: 'note' },
    update: {},
    create: {
      name: '隨筆',
      slug: 'note',
      sortOrder: 3,
    },
  });

  // 建立標籤
  console.log('建立標籤...');
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'javascript' },
      update: {},
      create: { name: 'JavaScript', slug: 'javascript' },
    }),
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: { name: 'TypeScript', slug: 'typescript' },
    }),
    prisma.tag.upsert({
      where: { slug: 'react' },
      update: {},
      create: { name: 'React', slug: 'react' },
    }),
    prisma.tag.upsert({
      where: { slug: 'nextjs' },
      update: {},
      create: { name: 'Next.js', slug: 'nextjs' },
    }),
    prisma.tag.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: { name: 'Node.js', slug: 'nodejs' },
    }),
    prisma.tag.upsert({
      where: { slug: 'prisma' },
      update: {},
      create: { name: 'Prisma', slug: 'prisma' },
    }),
    prisma.tag.upsert({
      where: { slug: 'postgresql' },
      update: {},
      create: { name: 'PostgreSQL', slug: 'postgresql' },
    }),
    prisma.tag.upsert({
      where: { slug: 'tdd' },
      update: {},
      create: { name: 'TDD', slug: 'tdd' },
    }),
    prisma.tag.upsert({
      where: { slug: 'frontend' },
      update: {},
      create: { name: '前端開發', slug: 'frontend' },
    }),
    prisma.tag.upsert({
      where: { slug: 'backend' },
      update: {},
      create: { name: '後端開發', slug: 'backend' },
    }),
  ]);

  // 建立文章
  console.log('建立文章...');
  const post1 = await prisma.post.upsert({
    where: { slug: 'welcome-to-novascribe' },
    update: {},
    create: {
      title: '歡迎來到 NovaScribe',
      slug: 'welcome-to-novascribe',
      content: `# 歡迎來到 NovaScribe

這是一個使用 Next.js 16、Prisma 7 和 PostgreSQL 建立的現代化部落格系統。

## 主要特色

- **現代化技術棧**：Next.js 16 App Router + TypeScript
- **強大的資料庫**：Prisma 7 ORM + PostgreSQL 18
- **完整的後台管理**：文章、分類、標籤、評論管理
- **評論系統**：支援嵌套回覆、反垃圾郵件、Markdown
- **SEO 優化**：完整的 meta tags、sitemap、結構化資料
- **響應式設計**：適配各種螢幕尺寸

開始探索吧！`,
      excerpt: '使用 Next.js 16、Prisma 7 和 PostgreSQL 建立的現代化部落格系統',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: techCategory.id,
    },
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tags[3].id }, // Next.js
      { postId: post1.id, tagId: tags[5].id }, // Prisma
      { postId: post1.id, tagId: tags[6].id }, // PostgreSQL
    ],
    skipDuplicates: true,
  });

  const post2 = await prisma.post.upsert({
    where: { slug: 'getting-started-with-nextjs' },
    update: {},
    create: {
      title: 'Next.js 16 入門指南',
      slug: 'getting-started-with-nextjs',
      content: `# Next.js 16 入門指南

Next.js 是一個強大的 React 框架，提供了許多開箱即用的功能。

## 為什麼選擇 Next.js？

1. **Server Components**：減少客戶端 JavaScript
2. **App Router**：更靈活的路由系統
3. **優秀的效能**：自動優化和程式碼分割
4. **內建 SEO**：完整的 metadata API

## 快速開始

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

就這麼簡單！`,
      excerpt: '了解 Next.js 16 的核心功能和快速開始方式',
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 86400000), // 昨天
      authorId: admin.id,
      categoryId: techCategory.id,
    },
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post2.id, tagId: tags[2].id }, // React
      { postId: post2.id, tagId: tags[3].id }, // Next.js
      { postId: post2.id, tagId: tags[8].id }, // 前端開發
    ],
    skipDuplicates: true,
  });

  const post3 = await prisma.post.upsert({
    where: { slug: 'draft-post-example' },
    update: {},
    create: {
      title: '草稿文章範例',
      slug: 'draft-post-example',
      content: '這是一篇草稿文章，尚未發佈。',
      excerpt: '草稿文章不會在前台顯示',
      status: 'DRAFT',
      authorId: admin.id,
      categoryId: noteCategory.id,
    },
  });

  // 建立站點設定
  console.log('建立站點設定...');
  await prisma.siteSetting.upsert({
    where: { key: 'site_name' },
    update: {},
    create: {
      key: 'site_name',
      value: 'NovaScribe',
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'site_description' },
    update: {},
    create: {
      key: 'site_description',
      value: '一個現代化的部落格系統',
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'comment_auto_approve' },
    update: {},
    create: {
      key: 'comment_auto_approve',
      value: 'false',
    },
  });

  console.log('✅ 前台內容建立完成！');
  console.log(`- 分類：3 個`);
  console.log(`- 標籤：${tags.length} 個`);
  console.log(`- 文章：3 篇（2 已發佈，1 草稿）`);
  console.log(`- 站點設定：3 筆`);
}

main()
  .catch((error) => {
    console.error('❌ Seed 失敗：', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
