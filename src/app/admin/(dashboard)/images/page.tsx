import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import { ImageGallery } from "@/components/admin/image-gallery";

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  await requireAuth();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const limit = 24;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.search) {
    where.OR = [
      { filename: { contains: params.search, mode: "insensitive" } },
      { altText: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [images, total] = await Promise.all([
    prisma.image.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.image.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">圖片庫</h1>
      <ImageGallery
        images={images.map((img) => ({
          id: img.id,
          url: img.url,
          filename: img.filename,
          altText: img.altText ?? "",
          size: img.size,
          createdAt: img.createdAt.toISOString(),
        }))}
        total={total}
        page={page}
        limit={limit}
      />
    </div>
  );
}
