import { auth } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma/client";

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as UserRole)) {
    throw new Error("Forbidden");
  }
  return session;
}
