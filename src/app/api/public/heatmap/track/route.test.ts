import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import crypto from "crypto";

// Mock the generated prisma client FIRST (before db.ts tries to import it)
vi.mock("@/generated/prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    heatmapEvent: { createMany: vi.fn() },
  })),
}));

// Mock prisma db module
const mockCreateMany = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    heatmapEvent: {
      createMany: (...args: unknown[]) => mockCreateMany(...args),
    },
  },
}));

// Import the handler AFTER mocks are set up
import { POST } from "./route";

// Helper to create a mock NextRequest
function createRequest(body: unknown) {
  return {
    json: () => Promise.resolve(body),
  } as unknown as import("next/server").NextRequest;
}

describe("Heatmap Tracking API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateMany.mockResolvedValue({ count: 0 });
  });

  describe("Input Validation", () => {
    it("should reject invalid data (missing articleId)", async () => {
      const req = createRequest({
        sessionId: "test-session",
        events: [{ eventType: "scroll", eventData: { scrollDepth: 50 } }],
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe("Invalid data");
    });

    it("should reject invalid event types", async () => {
      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId: "test-session",
        events: [{ eventType: "malicious_event", eventData: {} }],
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should reject empty sessionId", async () => {
      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId: "",
        events: [{ eventType: "scroll", eventData: { scrollDepth: 50 } }],
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("should accept valid scroll events", async () => {
      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId: "test-session-abc123",
        events: [
          { eventType: "scroll", eventData: { scrollDepth: 50 } },
          { eventType: "click", eventData: { linkUrl: "https://example.com" } },
        ],
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.ok).toBe(true);
    });

    it("should accept all valid event types", async () => {
      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId: "test-session",
        events: [
          { eventType: "scroll", eventData: { scrollDepth: 100 } },
          { eventType: "dwell", eventData: { paragraphId: "p1", dwellSeconds: 5 } },
          { eventType: "click", eventData: { linkUrl: "/about" } },
          { eventType: "exit", eventData: { exitDepth: 75 } },
        ],
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe("Privacy Protection - No PII Stored", () => {
    it("should hash session ID before storing (not store raw session ID)", async () => {
      const rawSessionId = "user-browser-session-12345";

      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId: rawSessionId,
        events: [{ eventType: "scroll", eventData: { scrollDepth: 30 } }],
      });

      await POST(req);

      expect(mockCreateMany).toHaveBeenCalledTimes(1);
      const callData = (mockCreateMany as Mock).mock.calls[0][0].data;

      // Verify stored session ID is NOT the raw session ID
      callData.forEach((event: { sessionId: string }) => {
        expect(event.sessionId).not.toBe(rawSessionId);
      });

      // Verify it's a SHA-256 hash (32 hex chars after slicing)
      callData.forEach((event: { sessionId: string }) => {
        expect(event.sessionId).toMatch(/^[a-f0-9]{32}$/);
      });
    });

    it("should produce consistent hash for same session ID", async () => {
      const sessionId = "consistent-session-id";
      const expectedHash = crypto
        .createHash("sha256")
        .update(sessionId)
        .digest("hex")
        .slice(0, 32);

      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId,
        events: [{ eventType: "scroll", eventData: { scrollDepth: 10 } }],
      });

      await POST(req);

      const storedSessionId = (mockCreateMany as Mock).mock.calls[0][0].data[0].sessionId;
      expect(storedSessionId).toBe(expectedHash);
    });

    it("should not store IP address in event data", async () => {
      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId: "test-session",
        events: [{ eventType: "scroll", eventData: { scrollDepth: 50 } }],
      });

      await POST(req);

      const callData = (mockCreateMany as Mock).mock.calls[0][0].data;
      callData.forEach((event: { data: Record<string, unknown> }) => {
        const dataStr = JSON.stringify(event.data);
        // Ensure no IP-like patterns in stored data
        expect(dataStr).not.toMatch(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
      });
    });

    it("should not store any user-agent information in events", async () => {
      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId: "test-session",
        events: [
          { eventType: "click", eventData: { linkUrl: "https://example.com" } },
        ],
      });

      await POST(req);

      const callData = (mockCreateMany as Mock).mock.calls[0][0].data;
      callData.forEach((event: { data: Record<string, unknown>; [key: string]: unknown }) => {
        expect(event).not.toHaveProperty("userAgent");
        expect(event).not.toHaveProperty("ipAddress");
        expect(event.data).not.toHaveProperty("userAgent");
        expect(event.data).not.toHaveProperty("ipAddress");
      });
    });
  });

  describe("Database Storage", () => {
    it("should batch insert all events in a single call", async () => {
      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId: "test-session",
        events: [
          { eventType: "scroll", eventData: { scrollDepth: 25 } },
          { eventType: "scroll", eventData: { scrollDepth: 50 } },
          { eventType: "dwell", eventData: { paragraphId: "p1", dwellSeconds: 4 } },
        ],
      });

      await POST(req);

      expect(mockCreateMany).toHaveBeenCalledTimes(1);
      const callData = (mockCreateMany as Mock).mock.calls[0][0].data;
      expect(callData).toHaveLength(3);
    });

    it("should store correct articleId for each event", async () => {
      const articleId = "550e8400-e29b-41d4-a716-446655440000";

      const req = createRequest({
        articleId,
        sessionId: "test-session",
        events: [{ eventType: "scroll", eventData: { scrollDepth: 80 } }],
      });

      await POST(req);

      const callData = (mockCreateMany as Mock).mock.calls[0][0].data;
      callData.forEach((event: { articleId: string }) => {
        expect(event.articleId).toBe(articleId);
      });
    });

    it("should preserve event type and data", async () => {
      const req = createRequest({
        articleId: "550e8400-e29b-41d4-a716-446655440000",
        sessionId: "test-session",
        events: [
          { eventType: "click", eventData: { linkUrl: "https://example.com", isExternal: true } },
        ],
      });

      await POST(req);

      const storedEvent = (mockCreateMany as Mock).mock.calls[0][0].data[0];
      expect(storedEvent.eventType).toBe("click");
      expect(storedEvent.data).toEqual({ linkUrl: "https://example.com", isExternal: true });
    });
  });
});
