import slugify from "slugify";

export function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, locale: "zh" });
}

export async function ensureUniqueSlug(
  prisma: { article: { count: (args: { where: { slug: string } }) => Promise<number> } },
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.article.count({
      where: { slug, ...(excludeId ? {} : {}) },
    });
    if (existing === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}
