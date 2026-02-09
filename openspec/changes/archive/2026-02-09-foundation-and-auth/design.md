## Context

NovaScribe 是一個從零開始的個人部落格專案，目前 repo 只有 README.md。此設計文件定義專案的技術基礎架構，包含框架選型、資料庫設計、認證機制、後台佈局，以及開發工具鏈設定。這是所有後續功能（內容管理、SEO 整合）的基石。

**現狀**：空白 repo，無任何程式碼。

**限制條件**：

- 個人部落格，單一管理者，不需多租戶架構
- 部署環境暫未確定（應保持彈性，支援 Vercel / 自架 / Docker）
- 須從第一天起建立 TDD 開發流程

## Goals / Non-Goals

**Goals：**

- 建立可維護、可擴展的 Next.js App Router 專案結構
- 建立 PostgreSQL 資料庫連線和 migration 流程
- 實作安全的後台認證機制
- 建立後台基礎佈局框架
- 設定完整的測試工具鏈（單元/整合/E2E）
- 為後續 SEO 最佳化預留架構空間

**Non-Goals：**

- 前台頁面渲染（屬於後續 change）
- 文章/分類/標籤等內容管理功能（屬於 content-management change）
- SEO / Analytics 整合（屬於 seo-and-analytics change）
- 多使用者權限管理（個人部落格，單一管理者足夠）
- OAuth 社群登入（初期只需帳密登入）

## Decisions

### 1. 專案結構：Next.js App Router + `src/` 目錄

```
novascribe/
├── src/
│   ├── app/
│   │   ├── (admin)/           # 後台路由群組
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx  # 後台佈局
│   │   │   │   └── page.tsx    # 儀表板首頁
│   │   │   └── login/
│   │   │       └── page.tsx    # 登入頁
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   ├── layout.tsx          # 根佈局
│   │   └── page.tsx            # 前台首頁（暫時空白）
│   ├── components/
│   │   ├── admin/              # 後台共用元件
│   │   └── ui/                 # 通用 UI 元件
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth.ts             # NextAuth 設定
│   │   └── utils.ts            # 共用工具函式
│   └── types/                  # TypeScript 型別定義
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
└── ...config files
```

**理由**：`src/` 目錄是 Next.js 官方推薦的結構，將原始碼與設定檔分離。`(admin)` route group 不會影響 URL 結構，讓後台和前台共存但佈局獨立。

**替代方案**：

- 不使用 `src/` → 根目錄會過於雜亂
- 使用 `pages/` router → App Router 是 Next.js 的未來方向，支援 RSC 和更靈活的佈局

### 2. 資料庫 Schema 設計

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}
```

**理由**：

- 使用 `cuid()` 作為 ID 而非自增整數，避免 ID 可預測性（安全考量）
- `passwordHash` 使用 bcrypt 雜湊，永不儲存明文密碼
- `@@map("users")` 使用複數形式作為資料表名稱（PostgreSQL 慣例）
- 初期只建立 users 資料表，其餘資料表在 content-management change 中建立

**替代方案**：

- UUID v4 → cuid 更短、可排序、碰撞機率極低
- Argon2 取代 bcrypt → bcrypt 已足夠成熟，生態系支援更廣泛

### 3. 認證方案：NextAuth.js + Credentials Provider

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        // 驗證帳密，回傳 user 或 null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
};
```

**理由**：

- NextAuth.js 是 Next.js 生態系中最成熟的認證方案
- Credentials Provider 適合個人部落格（單一管理者，不需社群登入）
- JWT session 策略不需要額外的 session 儲存，適合無狀態部署
- 後續如需 OAuth 可無痛新增 provider

**替代方案**：

- Lucia Auth → 較新但社群較小
- 自建 JWT → 容易出現安全漏洞，不推薦
- Database session → 需要額外的 session 資料表，對個人部落格來說過度

### 4. 後台路由保護：Middleware

```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  matcher: ['/admin/:path*'],
};
```

**理由**：Next.js middleware 在 edge 層攔截請求，未認證的使用者不會載入任何後台頁面，安全且效能好。

### 5. 後台佈局：側邊欄 + 頂部列

佈局結構：

- **側邊欄**（左側固定，可收合）：導覽選單（儀表板、文章、分類、標籤、媒體、SEO、設定）
- **頂部列**：使用者資訊、登出按鈕
- **主內容區**：右側自適應寬度
- **響應式**：行動裝置下側邊欄收合為漢堡選單

**理由**：這是後台管理系統的標準佈局模式，使用者熟悉度高。Tailwind CSS 原生支援響應式設計，不需要額外的 UI 框架。

**替代方案**：

- 使用 shadcn/ui → 可考慮，但初期先用純 Tailwind 保持簡單
- 使用 Ant Design / MUI → 太重，且與 Tailwind 風格衝突

### 6. 測試工具鏈

| 層級     | 工具                         | 用途                           |
| -------- | ---------------------------- | ------------------------------ |
| 單元測試 | Jest + React Testing Library | 元件、hooks、工具函式          |
| 整合測試 | Jest + MSW                   | API route handlers、資料庫操作 |
| E2E 測試 | Playwright                   | 登入流程、頁面導覽             |

**理由**：Jest 是 React 生態系的主流測試框架，RTL 鼓勵以使用者行為而非實作細節來測試。Playwright 比 Cypress 更快且支援多瀏覽器。

### 7. API 端點設計

此 change 的 API 端點僅涵蓋認證相關：

| 端點                      | 方法     | 說明                 |
| ------------------------- | -------- | -------------------- |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js 認證端點 |

內容管理相關的 API 端點將在 content-management change 中設計。

### 8. SEO 架構預留

雖然 SEO 功能屬於後續 change，但基礎架構需預留：

- 根 `layout.tsx` 使用 Next.js `metadata` API，支援動態 meta tags
- 保留 `robots.ts` 和 `sitemap.ts` 的檔案位置
- 使用語意化 HTML 結構

## Risks / Trade-offs

- **[Credentials 安全性]** Credentials Provider 相比 OAuth 缺少 MFA 支援 → 初期可接受，後續可加入 TOTP 二步驟驗證
- **[JWT 無法撤銷]** JWT session 無法主動撤銷已發出的 token → 設定較短的 token 過期時間（如 24 小時），且為個人部落格風險極低
- **[Prisma 冷啟動]** Prisma Client 在 serverless 環境首次查詢較慢 → 使用 singleton pattern 避免重複初始化
- **[單一管理者假設]** 整個認證系統假設只有一個管理者 → 如未來需要多管理者，需重構權限模型

## Migration Plan

1. 初始化 Next.js 專案並安裝所有相依套件
2. 設定開發工具（ESLint、Prettier、EditorConfig）
3. 設定 Prisma 並建立初始 migration（users 資料表）
4. 實作認證系統（NextAuth.js + middleware）
5. 建立後台佈局元件
6. 設定測試框架並撰寫基礎測試
7. 建立種子資料腳本（建立初始管理者帳號）

**Rollback**：此為全新專案，無需 rollback 策略。如需重來，刪除 repo 重新開始即可。

## Open Questions

- 部署平台選擇？（Vercel vs 自架 VPS vs Docker）— 暫不決定，架構保持平台無關
- 是否需要引入 shadcn/ui 作為 UI 元件庫？— 初期先用純 Tailwind，如果後續元件變多再引入
- 管理者帳號如何建立？— 透過 Prisma seed 腳本或 CLI 工具建立，不提供註冊頁面
