import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  content: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const excerpt = parsed.data.content.slice(0, 500);

  // If OPENAI_API_KEY is available, use OpenAI; otherwise return a fallback
  if (process.env.OPENAI_API_KEY) {
    try {
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
              role: "system",
              content:
                "請根據文章內容生成 150-160 字元的 Meta Description。要求：簡潔描述文章主旨、包含關鍵字、吸引讀者點擊、繁體中文、不用引號。",
            },
            {
              role: "user",
              content: excerpt,
            },
          ],
          max_tokens: 200,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const metaDescription =
          data.choices?.[0]?.message?.content?.trim() ?? "";
        return NextResponse.json({ metaDescription });
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: simple excerpt-based description
  const fallback = excerpt
    .replace(/[#*_\[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return NextResponse.json({ metaDescription: fallback });
}
