import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const trackSchema = z.object({
  articleId: z.string().uuid(),
  sessionId: z.string().min(1),
  events: z.array(
    z.object({
      eventType: z.enum(["scroll", "dwell", "click", "exit"]),
      eventData: z.record(z.unknown()),
    })
  ),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = trackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { articleId, sessionId, events } = parsed.data;

  // Hash the session ID for privacy
  const hashedSessionId = crypto
    .createHash("sha256")
    .update(sessionId)
    .digest("hex")
    .slice(0, 32);

  // Batch insert events
  await prisma.heatmapEvent.createMany({
    data: events.map((event) => ({
      articleId,
      sessionId: hashedSessionId,
      eventType: event.eventType,
      data: event.eventData as Record<string, unknown>,
    })),
  });

  return NextResponse.json({ ok: true });
}
