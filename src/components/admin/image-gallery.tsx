"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Copy, Loader2 } from "lucide-react";

interface ImageItem {
  id: string;
  url: string;
  filename: string;
  altText: string;
  size: number;
  createdAt: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  total: number;
  page: number;
  limit: number;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageGallery({ images, total, page, limit }: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/admin/images/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        window.location.reload();
      }
    } finally {
      setUploading(false);
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Upload className="mr-2 size-4" />
          )}
          上傳圖片
        </Button>
        <span className="text-sm text-muted-foreground">
          共 {total} 張圖片
        </span>
      </div>

      {images.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">尚無圖片</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-md border"
            >
              <div className="aspect-square">
                <img
                  src={image.url}
                  alt={image.altText || image.filename}
                  className="size-full object-cover"
                />
              </div>
              <div className="p-2">
                <p className="truncate text-xs font-medium">{image.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(image.size)}
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyUrl(image.url)}
                >
                  <Copy className="mr-1 size-3" />
                  複製 URL
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              asChild
            >
              <a href={`/admin/images?page=${p}`}>{p}</a>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
