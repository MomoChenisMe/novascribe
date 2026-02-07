"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { createArticle, updateArticle } from "@/app/admin/(dashboard)/articles/actions";
import { Save, Send, Sparkles, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface ArticleData {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  categoryId: string | null;
  tags: string[];
  status: string;
  metaTitle: string;
  metaDescription: string;
}

interface ArticleFormProps {
  article?: ArticleData;
  categories: Category[];
}

export function ArticleForm({ article, categories }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
  const [tagsInput, setTagsInput] = useState(article?.tags?.join(", ") ?? "");
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    article?.metaDescription ?? ""
  );
  const [error, setError] = useState("");
  const [generatingMeta, setGeneratingMeta] = useState(false);

  function buildPayload(status: string) {
    return {
      title,
      content,
      excerpt: excerpt || undefined,
      categoryId: categoryId || null,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
    };
  }

  function handleSave(status: "draft" | "published") {
    setError("");
    startTransition(async () => {
      try {
        const payload = buildPayload(status);
        if (article?.id) {
          await updateArticle(article.id, payload);
        } else {
          await createArticle(payload);
        }
        router.push("/admin/articles");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "操作失敗");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">標題</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章標題"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>內容</Label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="excerpt">摘要</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="文章摘要（最多 200 字元）"
            maxLength={200}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">分類</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="選擇分類" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">標籤</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="以逗號分隔標籤"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="SEO 標題"
          />
          <p className="text-xs text-muted-foreground">
            {metaTitle.length}/60 字元
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={generatingMeta || !content}
              onClick={async () => {
                setGeneratingMeta(true);
                try {
                  const res = await fetch(
                    "/api/admin/seo/generate-meta-description",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ content }),
                    }
                  );
                  if (res.ok) {
                    const data = await res.json();
                    setMetaDescription(data.metaDescription);
                  }
                } finally {
                  setGeneratingMeta(false);
                }
              }}
            >
              {generatingMeta ? (
                <Loader2 className="mr-1 size-3 animate-spin" />
              ) : (
                <Sparkles className="mr-1 size-3" />
              )}
              AI 生成
            </Button>
          </div>
          <Textarea
            id="metaDescription"
            value={metaDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(e.target.value)}
            placeholder="SEO 描述"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {metaDescription.length}/160 字元
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={isPending || !title}
          >
            <Save className="mr-2 size-4" />
            儲存草稿
          </Button>
          <Button
            type="button"
            onClick={() => handleSave("published")}
            disabled={isPending || !title}
          >
            <Send className="mr-2 size-4" />
            發布
          </Button>
        </div>
      </div>
    </div>
  );
}
