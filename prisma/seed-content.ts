/**
 * @file 內容種子資料腳本
 * @description 建立範例分類、標籤與文章資料。
 *   - 使用 upsert 確保可重複執行
 *   - 需要先執行 seed.ts 建立管理者帳號
 */

import { prisma } from '@/lib/prisma';

export async function seedContent(): Promise<void> {
  // 1. 取得管理者帳號
  const admin = await prisma.user.findFirst();
  if (!admin) {
    throw new Error('找不到使用者，請先執行 seed.ts 建立管理者帳號');
  }

  console.log(`使用管理者帳號: ${admin.email} (id: ${admin.id})`);

  // 2. 建立分類
  const techCategory = await prisma.category.upsert({
    where: { slug: 'technology' },
    create: {
      id: 'cat-technology',
      name: '技術',
      slug: 'technology',
      sortOrder: 0,
    },
    update: {
      name: '技術',
      sortOrder: 0,
    },
  });

  const frontendCategory = await prisma.category.upsert({
    where: { slug: 'frontend' },
    create: {
      id: 'cat-frontend',
      name: '前端開發',
      slug: 'frontend',
      parentId: techCategory.id,
      sortOrder: 1,
    },
    update: {
      name: '前端開發',
      parentId: techCategory.id,
      sortOrder: 1,
    },
  });

  const backendCategory = await prisma.category.upsert({
    where: { slug: 'backend' },
    create: {
      id: 'cat-backend',
      name: '後端開發',
      slug: 'backend',
      parentId: techCategory.id,
      sortOrder: 2,
    },
    update: {
      name: '後端開發',
      parentId: techCategory.id,
      sortOrder: 2,
    },
  });

  const lifestyleCategory = await prisma.category.upsert({
    where: { slug: 'lifestyle' },
    create: {
      id: 'cat-lifestyle',
      name: '生活',
      slug: 'lifestyle',
      sortOrder: 3,
    },
    update: {
      name: '生活',
      sortOrder: 3,
    },
  });

  console.log(`建立分類: ${[techCategory, frontendCategory, backendCategory, lifestyleCategory].map(c => c.name).join(', ')}`);

  // 3. 建立標籤
  const tagNextjs = await prisma.tag.upsert({
    where: { slug: 'nextjs' },
    create: { id: 'tag-nextjs', name: 'Next.js', slug: 'nextjs' },
    update: { name: 'Next.js' },
  });

  const tagReact = await prisma.tag.upsert({
    where: { slug: 'react' },
    create: { id: 'tag-react', name: 'React', slug: 'react' },
    update: { name: 'React' },
  });

  const tagTypescript = await prisma.tag.upsert({
    where: { slug: 'typescript' },
    create: { id: 'tag-typescript', name: 'TypeScript', slug: 'typescript' },
    update: { name: 'TypeScript' },
  });

  const tagPrisma = await prisma.tag.upsert({
    where: { slug: 'prisma' },
    create: { id: 'tag-prisma', name: 'Prisma', slug: 'prisma' },
    update: { name: 'Prisma' },
  });

  const tagTailwind = await prisma.tag.upsert({
    where: { slug: 'tailwindcss' },
    create: { id: 'tag-tailwindcss', name: 'Tailwind CSS', slug: 'tailwindcss' },
    update: { name: 'Tailwind CSS' },
  });

  console.log(`建立標籤: ${[tagNextjs, tagReact, tagTypescript, tagPrisma, tagTailwind].map(t => t.name).join(', ')}`);

  // 4. 建立文章
  const post1 = await prisma.post.upsert({
    where: { slug: 'getting-started-with-nextjs' },
    create: {
      id: 'post-nextjs-intro',
      title: 'Next.js 入門指南',
      slug: 'getting-started-with-nextjs',
      content: `# Next.js 入門指南

Next.js 是一個基於 React 的全端框架，提供了伺服器端渲染、靜態網站生成等強大功能。

## 為什麼選擇 Next.js？

- **伺服器端渲染 (SSR)**：提升 SEO 和首屏載入速度
- **靜態網站生成 (SSG)**：適合內容導向的網站
- **API Routes**：內建 API 端點支援
- **檔案系統路由**：直覺的路由設計

## 快速開始

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

開始你的 Next.js 之旅吧！`,
      excerpt: 'Next.js 是一個基於 React 的全端框架，本文帶你快速入門。',
      status: 'PUBLISHED',
      publishedAt: new Date('2026-01-15T10:00:00Z'),
      authorId: admin.id,
      categoryId: frontendCategory.id,
    },
    update: {
      title: 'Next.js 入門指南',
      content: `# Next.js 入門指南

Next.js 是一個基於 React 的全端框架，提供了伺服器端渲染、靜態網站生成等強大功能。`,
    },
  });

  const post2 = await prisma.post.upsert({
    where: { slug: 'prisma-orm-guide' },
    create: {
      id: 'post-prisma-guide',
      title: 'Prisma ORM 完整指南',
      slug: 'prisma-orm-guide',
      content: `# Prisma ORM 完整指南

Prisma 是 Node.js 和 TypeScript 的下一代 ORM，提供型別安全的資料庫存取。

## 核心概念

- **Prisma Schema**：定義資料模型
- **Prisma Client**：型別安全的查詢建構器
- **Prisma Migrate**：資料庫遷移工具

## 定義 Schema

\`\`\`prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String?
  posts Post[]
}
\`\`\``,
      excerpt: 'Prisma 是 Node.js 和 TypeScript 的下一代 ORM，本文提供完整使用指南。',
      status: 'PUBLISHED',
      publishedAt: new Date('2026-01-20T14:00:00Z'),
      authorId: admin.id,
      categoryId: backendCategory.id,
    },
    update: {
      title: 'Prisma ORM 完整指南',
    },
  });

  const post3 = await prisma.post.upsert({
    where: { slug: 'tailwind-css-best-practices' },
    create: {
      id: 'post-tailwind-tips',
      title: 'Tailwind CSS 最佳實踐',
      slug: 'tailwind-css-best-practices',
      content: `# Tailwind CSS 最佳實踐

Tailwind CSS 是一個 utility-first 的 CSS 框架，讓你快速建構現代化 UI。

## 重點技巧

1. 善用 @apply 提取常用樣式
2. 使用自訂色彩系統
3. 響應式設計優先`,
      excerpt: '分享 Tailwind CSS 的最佳實踐和常用技巧。',
      status: 'DRAFT',
      authorId: admin.id,
      categoryId: frontendCategory.id,
    },
    update: {
      title: 'Tailwind CSS 最佳實踐',
    },
  });

  console.log(`建立文章: ${[post1, post2, post3].map(p => p.title).join(', ')}`);

  // 5. 建立文章標籤關聯
  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tagNextjs.id },
      { postId: post1.id, tagId: tagReact.id },
      { postId: post1.id, tagId: tagTypescript.id },
    ],
    skipDuplicates: true,
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post2.id, tagId: tagPrisma.id },
      { postId: post2.id, tagId: tagTypescript.id },
    ],
    skipDuplicates: true,
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post3.id, tagId: tagTailwind.id },
    ],
    skipDuplicates: true,
  });

  console.log('建立文章標籤關聯完成');

  // 6. 建立版本記錄
  await prisma.postVersion.create({
    data: {
      postId: post1.id,
      title: post1.title,
      content: 'Next.js 入門指南初版內容',
      version: 1,
    },
  });

  await prisma.postVersion.create({
    data: {
      postId: post2.id,
      title: post2.title,
      content: 'Prisma ORM 完整指南初版內容',
      version: 1,
    },
  });

  await prisma.postVersion.create({
    data: {
      postId: post3.id,
      title: post3.title,
      content: 'Tailwind CSS 最佳實踐初版內容',
      version: 1,
    },
  });

  console.log('建立版本記錄完成');
  console.log('內容種子資料建立完成！');
}

// Execute when run directly
const isDirectExecution =
  typeof require !== 'undefined' && require.main === module;

if (isDirectExecution) {
  seedContent()
    .catch((e) => {
      console.error('Content seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
