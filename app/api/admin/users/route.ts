import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/admin-auth";

const DEFAULT_STORAGE_LIMIT = 40 * 1024 * 1024; // 40 MB

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
    },
  });
}

// GET - List users with storage usage and limit stats
export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminAuth(req);
  if (!authCheck.isAuthorized) {
    return NextResponse.json(
      { error: authCheck.error },
      {
        status: authCheck.status,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const roleFilter = searchParams.get("role") || "";
    const tierFilter = searchParams.get("tier") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));

    const searchCondition = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { id: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const roleCondition = roleFilter && roleFilter !== "all" ? { role: roleFilter } : {};

    const users = await prisma.user.findMany({
      where: {
        AND: [searchCondition, roleCondition],
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        lastLoginMethod: true,
        hasUsedFreeExtraction: true,
        storageLimit: true,
        maxInvoices: true,
        role: true,
      },
      orderBy: sortBy === "name" || sortBy === "email" || sortBy === "createdAt"
        ? { [sortBy]: sortOrder }
        : { createdAt: "desc" },
    });

    // Fetch invoice aggregations per user (file sizes, counts)
    const allInvoices = await prisma.invoice.findMany({
      select: {
        userId: true,
        fileSize: true,
        isManuallyCreated: true,
      },
    });

    // Group invoice stats by userId
    const userInvoiceStats: Record<
      string,
      { totalSize: number; totalInvoices: number; uploaded: number; created: number }
    > = {};

    for (const inv of allInvoices) {
      if (!userInvoiceStats[inv.userId]) {
        userInvoiceStats[inv.userId] = {
          totalSize: 0,
          totalInvoices: 0,
          uploaded: 0,
          created: 0,
        };
      }
      userInvoiceStats[inv.userId].totalSize += inv.fileSize || 0;
      userInvoiceStats[inv.userId].totalInvoices += 1;
      if (inv.isManuallyCreated) {
        userInvoiceStats[inv.userId].created += 1;
      } else {
        userInvoiceStats[inv.userId].uploaded += 1;
      }
    }

    // Combine user records with calculated stats
    let usersWithStats = users.map((u) => {
      const stats = userInvoiceStats[u.id] || {
        totalSize: 0,
        totalInvoices: 0,
        uploaded: 0,
        created: 0,
      };

      const storageLimit = Number(u.storageLimit ?? DEFAULT_STORAGE_LIMIT);
      const usedStorage = stats.totalSize;
      const remainingStorage = Math.max(0, storageLimit - usedStorage);
      const percentUsed = storageLimit > 0
        ? parseFloat(((usedStorage / storageLimit) * 100).toFixed(2))
        : 0;

      const isNearLimit = percentUsed >= 80;
      const isOverLimit = usedStorage > storageLimit;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: Boolean(u.emailVerified),
        image: u.image,
        role: u.role || "user",
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        lastLoginMethod: u.lastLoginMethod,
        hasUsedFreeExtraction: Boolean(u.hasUsedFreeExtraction),
        storageLimit,
        maxInvoices: u.maxInvoices !== undefined ? u.maxInvoices : 100,
        usedStorage,
        remainingStorage,
        percentUsed,
        isNearLimit,
        isOverLimit,
        totalInvoices: stats.totalInvoices,
        uploadedInvoices: stats.uploaded,
        createdInvoices: stats.created,
      };
    });

    // Apply tier filtering if specified
    if (tierFilter === "near_limit") {
      usersWithStats = usersWithStats.filter((u) => u.percentUsed >= 80);
    } else if (tierFilter === "high") {
      usersWithStats = usersWithStats.filter((u) => u.usedStorage >= 40 * 1024 * 1024);
    } else if (tierFilter === "normal") {
      usersWithStats = usersWithStats.filter((u) => u.usedStorage < 10 * 1024 * 1024);
    } else if (tierFilter === "normal_mid") {
      usersWithStats = usersWithStats.filter(
        (u) => u.usedStorage >= 10 * 1024 * 1024 && u.usedStorage < 40 * 1024 * 1024
      );
    } else if (tierFilter === "power") {
      usersWithStats = usersWithStats.filter((u) => u.usedStorage >= 100 * 1024 * 1024);
    }

    // Apply sorting by calculated fields if requested
    if (sortBy === "usedStorage") {
      usersWithStats.sort((a, b) =>
        sortOrder === "asc" ? a.usedStorage - b.usedStorage : b.usedStorage - a.usedStorage
      );
    } else if (sortBy === "totalInvoices") {
      usersWithStats.sort((a, b) =>
        sortOrder === "asc" ? a.totalInvoices - b.totalInvoices : b.totalInvoices - a.totalInvoices
      );
    } else if (sortBy === "percentUsed") {
      usersWithStats.sort((a, b) =>
        sortOrder === "asc" ? a.percentUsed - b.percentUsed : b.percentUsed - a.percentUsed
      );
    }

    const totalUsers = usersWithStats.length;
    const paginatedUsers = usersWithStats.slice((page - 1) * limit, page * limit);

    return NextResponse.json(
      {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit) || 1,
        },
      },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    console.error("Error in admin users API:", error);
    return NextResponse.json(
      { error: "Failed to fetch users: " + (error instanceof Error ? error.message : String(error)) },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
