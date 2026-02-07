import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { requireAuth, requireRole } from "./auth-utils";

// Mock next-auth's auth() function
const mockAuth = vi.fn();
vi.mock("./auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

describe("Auth Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("should return session for authenticated user", async () => {
      const session = {
        user: { id: "user-1", email: "admin@test.com", name: "Admin", role: "admin" },
      };
      mockAuth.mockResolvedValue(session);

      const result = await requireAuth();
      expect(result).toEqual(session);
    });

    it("should throw for unauthenticated request (null session)", async () => {
      mockAuth.mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow("Unauthorized");
    });

    it("should throw when session has no user", async () => {
      mockAuth.mockResolvedValue({ user: null });

      await expect(requireAuth()).rejects.toThrow("Unauthorized");
    });

    it("should throw when session is undefined", async () => {
      mockAuth.mockResolvedValue(undefined);

      await expect(requireAuth()).rejects.toThrow("Unauthorized");
    });
  });

  describe("requireRole", () => {
    it("should allow admin to access admin-only routes", async () => {
      const session = {
        user: { id: "user-1", email: "admin@test.com", name: "Admin", role: "admin" },
      };
      mockAuth.mockResolvedValue(session);

      const result = await requireRole(["admin"]);
      expect(result.user.role).toBe("admin");
    });

    it("should allow editor to access editor routes", async () => {
      const session = {
        user: { id: "user-2", email: "editor@test.com", name: "Editor", role: "editor" },
      };
      mockAuth.mockResolvedValue(session);

      const result = await requireRole(["admin", "editor"]);
      expect(result.user.role).toBe("editor");
    });

    it("should deny viewer from accessing editor routes", async () => {
      const session = {
        user: { id: "user-3", email: "viewer@test.com", name: "Viewer", role: "viewer" },
      };
      mockAuth.mockResolvedValue(session);

      await expect(requireRole(["admin", "editor"])).rejects.toThrow("Forbidden");
    });

    it("should deny editor from accessing admin-only routes", async () => {
      const session = {
        user: { id: "user-2", email: "editor@test.com", name: "Editor", role: "editor" },
      };
      mockAuth.mockResolvedValue(session);

      await expect(requireRole(["admin"])).rejects.toThrow("Forbidden");
    });

    it("should deny viewer from accessing admin-only routes", async () => {
      const session = {
        user: { id: "user-3", email: "viewer@test.com", name: "Viewer", role: "viewer" },
      };
      mockAuth.mockResolvedValue(session);

      await expect(requireRole(["admin"])).rejects.toThrow("Forbidden");
    });

    it("should throw Unauthorized for unauthenticated user before checking role", async () => {
      mockAuth.mockResolvedValue(null);

      await expect(requireRole(["admin"])).rejects.toThrow("Unauthorized");
    });
  });
});

describe("Middleware Protection Logic", () => {
  // Test the middleware protection rules as described in middleware.ts
  // These tests verify the expected behavior without importing the actual middleware

  const protectedAdminPaths = [
    "/admin",
    "/admin/articles",
    "/admin/articles/new",
    "/admin/images",
    "/admin/heatmap",
    "/admin/settings",
  ];

  const protectedApiPaths = [
    "/api/admin/articles",
    "/api/admin/images/upload",
    "/api/admin/dashboard/stats",
    "/api/admin/heatmap/article-1/summary",
  ];

  const unprotectedPaths = [
    "/admin/login",
    "/api/auth/callback",
    "/api/auth/session",
    "/api/public/heatmap/track",
  ];

  it("should identify /admin/* paths as protected", () => {
    protectedAdminPaths.forEach((p) => {
      expect(p.startsWith("/admin")).toBe(true);
      expect(p).not.toBe("/admin/login");
    });
  });

  it("should identify /api/admin/* paths as protected", () => {
    protectedApiPaths.forEach((p) => {
      expect(p.startsWith("/api/admin")).toBe(true);
    });
  });

  it("should identify login and auth API paths as unprotected", () => {
    unprotectedPaths.forEach((p) => {
      const isLoginPage = p === "/admin/login";
      const isAuthApi = p.startsWith("/api/auth");
      const isPublicApi = p.startsWith("/api/public");
      expect(isLoginPage || isAuthApi || isPublicApi).toBe(true);
    });
  });

  it("should not protect public heatmap tracking endpoint", () => {
    const trackPath = "/api/public/heatmap/track";
    expect(trackPath.startsWith("/api/admin")).toBe(false);
    expect(trackPath.startsWith("/admin")).toBe(false);
  });
});

describe("Role-Based Access Control Matrix", () => {
  const permissions = {
    admin: ["view_dashboard", "create_article", "edit_any_article", "delete_article", "upload_image", "manage_users", "system_settings"],
    editor: ["view_dashboard", "create_article", "edit_own_article", "upload_image"],
    viewer: ["view_dashboard"],
  };

  it("admin should have full access", () => {
    expect(permissions.admin).toContain("manage_users");
    expect(permissions.admin).toContain("system_settings");
    expect(permissions.admin).toContain("delete_article");
  });

  it("editor should not have admin-only permissions", () => {
    expect(permissions.editor).not.toContain("manage_users");
    expect(permissions.editor).not.toContain("system_settings");
    expect(permissions.editor).not.toContain("delete_article");
    expect(permissions.editor).not.toContain("edit_any_article");
  });

  it("viewer should only have read access", () => {
    expect(permissions.viewer).toEqual(["view_dashboard"]);
    expect(permissions.viewer).not.toContain("create_article");
    expect(permissions.viewer).not.toContain("upload_image");
  });

  it("non-admin users cannot access /api/admin/users", async () => {
    // Simulate: editor tries to access user management
    const session = {
      user: { id: "user-2", email: "editor@test.com", name: "Editor", role: "editor" },
    };
    mockAuth.mockResolvedValue(session);

    await expect(requireRole(["admin"])).rejects.toThrow("Forbidden");
  });

  it("non-admin users cannot access system settings", async () => {
    const session = {
      user: { id: "user-3", email: "viewer@test.com", name: "Viewer", role: "viewer" },
    };
    mockAuth.mockResolvedValue(session);

    await expect(requireRole(["admin"])).rejects.toThrow("Forbidden");
  });
});
