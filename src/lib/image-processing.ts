import sharp from "sharp";
import path from "path";
import { writeFile } from "fs/promises";

interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
}

interface ThumbnailPaths {
  small: string;
  medium: string;
  large: string;
}

const THUMBNAIL_SIZES = {
  small: 200,
  medium: 600,
  large: 1200,
} as const;

const MAX_WIDTH = 1920;
const QUALITY = 80;

export async function processImage(
  inputBuffer: Buffer,
  mimeType: string
): Promise<ProcessedImage> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();

  let pipeline = image;

  // Resize if wider than MAX_WIDTH, preserving aspect ratio
  if (metadata.width && metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, undefined, { fit: "inside", withoutEnlargement: true });
  }

  // Apply format-specific compression
  if (mimeType === "image/jpeg") {
    pipeline = pipeline.jpeg({ quality: QUALITY });
  } else if (mimeType === "image/png") {
    pipeline = pipeline.png({ quality: QUALITY });
  } else if (mimeType === "image/webp") {
    pipeline = pipeline.webp({ quality: QUALITY });
  }
  // GIF: pass through without recompression

  const outputBuffer = await pipeline.toBuffer();
  const outputMetadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    width: outputMetadata.width ?? 0,
    height: outputMetadata.height ?? 0,
    size: outputBuffer.length,
  };
}

export async function generateThumbnails(
  inputBuffer: Buffer,
  uploadDir: string,
  baseFilename: string,
  ext: string
): Promise<ThumbnailPaths> {
  const paths: Partial<ThumbnailPaths> = {};

  for (const [label, size] of Object.entries(THUMBNAIL_SIZES)) {
    const thumbFilename = `${baseFilename}_${label}${ext}`;
    const thumbPath = path.join(uploadDir, thumbFilename);

    const thumbBuffer = await sharp(inputBuffer)
      .resize(size, size, { fit: "cover" })
      .jpeg({ quality: QUALITY })
      .toBuffer();

    await writeFile(thumbPath, thumbBuffer);
    paths[label as keyof ThumbnailPaths] = thumbFilename;
  }

  return paths as ThumbnailPaths;
}

export async function generateAltText(
  imageBuffer: Buffer,
  mimeType: string
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const base64 = imageBuffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "請用繁體中文描述這張圖片的主要內容，以便作為網頁的 Alt Text。要求：1. 簡潔明確，最多 125 字元 2. 描述主要元素與視覺重點 3. 適合無障礙閱讀器朗讀 4. 不要使用「這是一張...的圖片」開頭",
              },
              {
                type: "image_url",
                image_url: { url: dataUri },
              },
            ],
          },
        ],
        max_tokens: 200,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const altText = data.choices?.[0]?.message?.content?.trim() ?? null;
      return altText ? altText.slice(0, 125) : null;
    }
  } catch {
    // AI alt text generation failed, return null
  }

  return null;
}
