"use client";

import { useEffect, useRef } from "react";

interface HeatmapTrackerProps {
  articleId: string;
}

function getSessionId(): string {
  const key = "ns_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export function HeatmapTracker({ articleId }: HeatmapTrackerProps) {
  const eventsBuffer = useRef<
    Array<{ eventType: string; eventData: Record<string, unknown> }>
  >([]);
  const lastScrollDepth = useRef(0);

  useEffect(() => {
    const sessionId = getSessionId();

    function pushEvent(
      eventType: string,
      eventData: Record<string, unknown>
    ) {
      eventsBuffer.current.push({ eventType, eventData });
    }

    function flush() {
      if (eventsBuffer.current.length === 0) return;
      const events = [...eventsBuffer.current];
      eventsBuffer.current = [];

      navigator.sendBeacon(
        "/api/public/heatmap/track",
        JSON.stringify({ articleId, sessionId, events })
      );
    }

    // Scroll tracking
    function onScroll() {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const depth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      // Record every 10% milestone
      const milestone = Math.floor(depth / 10) * 10;
      if (milestone > lastScrollDepth.current) {
        lastScrollDepth.current = milestone;
        pushEvent("scroll", { scrollDepth: milestone });
      }
    }

    // Click tracking
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link) {
        pushEvent("click", {
          linkUrl: link.href,
          isExternal: link.hostname !== window.location.hostname,
        });
      }
    }

    // Exit tracking
    function onBeforeUnload() {
      pushEvent("exit", { exitDepth: lastScrollDepth.current });
      flush();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    window.addEventListener("beforeunload", onBeforeUnload);

    // Flush buffer every 10 seconds
    const interval = setInterval(flush, 10000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      window.removeEventListener("beforeunload", onBeforeUnload);
      clearInterval(interval);
      flush();
    };
  }, [articleId]);

  return null;
}
