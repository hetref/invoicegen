import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export interface AdminAuthResult {
  isAuthorized: boolean;
  adminUser?: any;
  error?: string;
  status: number;
}

/**
 * Validates admin authorization for incoming requests.
 * Supports:
 * 1. x-admin-key or Authorization Bearer header matching ADMIN_SECRET_KEY
 * 2. Authenticated user session with role === 'admin'
 */
export async function verifyAdminAuth(req: NextRequest): Promise<AdminAuthResult> {
  const configuredSecret = process.env.ADMIN_SECRET_KEY;

  // Check API Key headers
  const adminKeyHeader = req.headers.get("x-admin-key");
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : null;

  if (
    (adminKeyHeader && adminKeyHeader === configuredSecret) ||
    (bearerToken && bearerToken === configuredSecret)
  ) {
    return { isAuthorized: true, status: 200 };
  }

  // Fallback: Check authenticated session with role 'admin'
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, role: true },
      });

      if (user?.role === "admin") {
        return { isAuthorized: true, adminUser: user, status: 200 };
      }
    }
  } catch (error) {
    console.error("Error checking session in admin auth:", error);
  }

  return {
    isAuthorized: false,
    error: "Unauthorized: Invalid or missing admin credentials",
    status: 401,
  };
}
