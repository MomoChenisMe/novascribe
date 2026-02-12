## Why

NovaScribe 是一個從零開始的個人部落格系統。在建立任何功能之前，需要先打好專案基礎架構，包含 Next.js App Router 專案初始化、PostgreSQL 資料庫連線與 schema 設計、後台認證機制。這是所有後續功能的前提，沒有基礎建設就無法進行內容管理、SEO 整合等工作。

## What Changes

- 初始化 Next.js 專案（App Router + TypeScript + Tailwind CSS）
- 設定 ESLint、Prettier、EditorConfig 等開發工具
- 設定 Prisma ORM 並連接 PostgreSQL 18
- 設計基礎資料庫 schema（users 資料表）
- 建立後台路由群組（`/admin`）與基礎佈局
- 實作後台登入/登出認證機制（NextAuth.js）
- 建立受保護的後台路由中介層
- 設定測試框架（Jest + React Testing Library + Playwright）
- 建立 CI 基礎設定

## Capabilities

### New Capabilities

- `project-setup`：Next.js App Router 專案初始化，包含 TypeScript、Tailwind CSS、ESLint、Prettier 設定，以及測試框架（Jest + RTL + Playwright）配置
- `database-setup`：Prisma ORM 設定、PostgreSQL 18 連線配置、基礎 migration 流程建立、users 資料表設計
- `admin-auth`：後台登入/登出機制（NextAuth.js），session 管理，受保護路由中介層，確保只有認證使用者能存取 `/admin` 路由
- `admin-layout`：後台基礎佈局（側邊欄導覽、頂部列、響應式設計），作為所有後台頁面的共用框架

### Modified Capabilities

（無，這是全新專案）

## Impact

- **專案結構**：從空白 repo 建立完整的 Next.js 專案目錄結構
- **資料庫**：建立 PostgreSQL 連線和初始 migration
- **相依套件**：next、react、typescript、tailwindcss、prisma、next-auth、jest、@testing-library/react、playwright
- **環境變數**：DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL
- **開發工具**：ESLint、Prettier、EditorConfig、Jest config、Playwright config
