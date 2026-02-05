# Proposal: NovaScribe Core Implementation (Frontend & Backend)

## 1. Goal
Implement the core reader-facing and creator-facing features for NovaScribe as defined in PRD sections 3.1 and 3.2.

## 2. Scope

### 3.1 Frontend (Reader Interface)
- **Homepage**: Article listing with pagination/infinite scroll, featured posts, category navigation.
- **Article Details**: Markdown rendering, code highlighting, TOC, SEO metadata (JSON-LD).
- **Search**: Full-text and AI semantic search (pgvector).
- **Reading Mode**: Distraction-free view.
- **Static Pages**: About, Contact.
- **PWA**: Service workers for offline reading.

### 3.2 Backend (Management Interface)
- **Dashboard**: GA API stats, content health overview.
- **Article Management**: CRUD for posts, Markdown editor, status toggle.
- **Media Management**: Local file uploads with AI-generated Alt Text.
- **SEO/Site Settings**: Meta tag editing, GA/GSC tracking configuration.
- **Version Control**: Post modification history.
- **Analytics**: Heatmaps for reader interaction.

## 3. Tech Stack
- Next.js 16.1 (App Router)
- Tailwind CSS
- PostgreSQL + pgvector
- Auth.js for admin access
