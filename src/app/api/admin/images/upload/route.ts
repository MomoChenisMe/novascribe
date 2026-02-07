import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role: string }).role;
  if (!["admin", "editor"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const files = formData.getAll("file") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  if (files.length > 20) {
    return NextResponse.json(
      { error: "Maximum 20 files per upload" },
      { status: 400 }
    );
  }

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "images",
    year,
    month
  );

  await mkdir(uploadDir, { recursive: true });

  const results = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      results.push({ error: `Unsupported format: ${file.type}`, filename: file.name });
      continue;
    }

    if (file.size > MAX_SIZE) {
      results.push({ error: "File too large (max 10MB)", filename: file.name });
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = crypto.randomBytes(4).toString("hex");
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${dateStr}_${hash}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const urlPath = `/uploads/images/${year}/${month}/${filename}`;

    await writeFile(filePath, buffer);

    const image = await prisma.image.create({
      data: {
        filename,
        originalFilename: file.name,
        path: filePath,
        url: urlPath,
        size: file.size,
        mimeType: file.type,
        uploadedBy: session.user.id,
      },
    });

    results.push({
      id: image.id,
      url: image.url,
      filename: image.filename,
      altText: image.altText,
    });
  }

  return NextResponse.json({ images: results });
}
