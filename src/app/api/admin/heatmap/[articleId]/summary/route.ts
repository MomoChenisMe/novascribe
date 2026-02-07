import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { articleId } = await params;

  const events = await prisma.heatmapEvent.findMany({
    where: { articleId },
  });

  const sessions = new Set(events.map((e) => e.sessionId));
  const totalViews = sessions.size;

  const scrollEvents = events.filter((e) => e.eventType === "scroll");
  const avgScrollDepth =
    scrollEvents.length > 0
      ? scrollEvents.reduce((sum, e) => {
          const data = e.data as { scrollDepth?: number };
          return sum + (data.scrollDepth ?? 0);
        }, 0) / scrollEvents.length
      : 0;

  const exitEvents = events.filter((e) => e.eventType === "exit");
  const fullScrolls = scrollEvents.filter((e) => {
    const data = e.data as { scrollDepth?: number };
    return (data.scrollDepth ?? 0) >= 100;
  });
  const completionRate =
    totalViews > 0 ? fullScrolls.length / totalViews : 0;

  const dwellEvents = events.filter((e) => e.eventType === "dwell");
  const avgDwellTime =
    dwellEvents.length > 0
      ? dwellEvents.reduce((sum, e) => {
          const data = e.data as { dwellSeconds?: number };
          return sum + (data.dwellSeconds ?? 0);
        }, 0) / dwellEvents.length
      : 0;

  return NextResponse.json({
    totalViews,
    avgScrollDepth: Math.round(avgScrollDepth * 10) / 10,
    completionRate: Math.round(completionRate * 100) / 100,
    avgDwellTime: Math.round(avgDwellTime),
    eventCount: events.length,
  });
}
