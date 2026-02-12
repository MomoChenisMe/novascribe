-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "meta_title" VARCHAR(70),
    "meta_description" VARCHAR(160),
    "og_title" VARCHAR(95),
    "og_description" VARCHAR(200),
    "og_image" TEXT,
    "twitter_card" TEXT NOT NULL DEFAULT 'summary_large_image',
    "canonical_url" TEXT,
    "no_index" BOOLEAN NOT NULL DEFAULT false,
    "no_follow" BOOLEAN NOT NULL DEFAULT false,
    "focus_keyword" VARCHAR(100),
    "seo_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sitemap_configs" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "changefreq" TEXT NOT NULL DEFAULT 'weekly',
    "priority" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sitemap_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_metadata_postId_key" ON "seo_metadata"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "sitemap_configs_path_key" ON "sitemap_configs"("path");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- AddForeignKey
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
