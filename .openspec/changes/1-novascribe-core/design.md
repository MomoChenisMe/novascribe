# Design: NovaScribe Core Architecture

## 1. System Architecture
NovaScribe uses Next.js 16.1 (App Router) for a full-stack unified experience.

### Backend/API
- **Database**: PostgreSQL (Prisma/Drizzle) + pgvector for semantic search.
- **Auth**: Auth.js (NextAuth) for secure dashboard access.
- **File System**: Local `public/uploads` for media, abstracting for Cloudflare R2.

### Frontend
- **Rendering**: Static Site Generation (SSG) with Incremental Static Regeneration (ISR) for articles.
- **Client**: Tailwind CSS + Shadcn UI.
- **PWA**: `next-pwa` or custom Service Worker.

## 2. Data Model (High Level)
- `Post`: Title, slug, content, metadata, status, categoryId, tags.
- `Category`: Name, slug, description.
- `PostVersion`: Hash, content diff, timestamp.
- `Media`: Path, altText, type.
- `Setting`: Key, value (for GA/GSC).

## 3. Workflow
1. Author writes in Markdown editor in `/dashboard`.
2. Content is saved to DB, versions tracked.
3. SSG builds the reader page in `/posts/[slug]`.
4. AI hooks trigger for Alt Text and Summaries.
