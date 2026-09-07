import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/admin-auth";

const DEFAULT_STORAGE_LIMIT = 40 * 1024 * 1024;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
    },
  });
}

// GET - Overall platform and storage metrics
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
    const [users, invoices, groups] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          role: true,
          storageLimit: true,
          createdAt: true,
        },
      }),
      prisma.invoice.findMany({
        select: {
          userId: true,
          fileSize: true,
          isManuallyCreated: true,
        },
      }),
      prisma.group.count(),
    ]);

    const totalUsers = users.length;
    const verifiedUsers = users.filter((u) => u.emailVerified).length;
    const totalAdmins = users.filter((u) => u.role === "admin").length;
    const totalInvoices = invoices.length;
    const uploadedInvoices = invoices.filter((i) => !i.isManuallyCreated).length;
    const createdInvoices = invoices.filter((i) => i.isManuallyCreated).length;

    // Storage calculations
    const totalStorageUsed = invoices.reduce((sum, i) => sum + (i.fileSize || 0), 0);
    const totalAllocatedStorage = users.reduce(
      (sum, u) => sum + Number(u.storageLimit ?? DEFAULT_STORAGE_LIMIT),
      0
    );

    // Per-user usage aggregation
    const userUsageMap: Record<string, number> = {};
    for (const inv of invoices) {
      userUsageMap[inv.userId] = (userUsageMap[inv.userId] || 0) + (inv.fileSize || 0);
    }

    // Storage distribution tiers
    let tierUnder10MB = 0;
    let tier10to40MB = 0;
    let tier40to100MB = 0;
    let tierOver100MB = 0;

    for (const u of users) {
      const usage = userUsageMap[u.id] || 0;
      if (usage < 10 * 1024 * 1024) tierUnder10MB++;
      else if (usage <= 40 * 1024 * 1024) tier10to40MB++;
      else if (usage <= 100 * 1024 * 1024) tier40to100MB++;
      else tierOver100MB++;
    }

    // Top 5 users by storage usage
    const topUsers = [...users]
      .map((u) => {
        const usage = userUsageMap[u.id] || 0;
        const limit = Number(u.storageLimit ?? DEFAULT_STORAGE_LIMIT);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          usedStorage: usage,
          storageLimit: limit,
          percentUsed: limit > 0 ? parseFloat(((usage / limit) * 100).toFixed(2)) : 0,
        };
      })
      .sort((a, b) => b.usedStorage - a.usedStorage)
      .slice(0, 5);

    return NextResponse.json(
      {
        totalUsers,
        verifiedUsers,
        totalAdmins,
        totalInvoices,
        uploadedInvoices,
        createdInvoices,
        totalGroups: groups,
        totalStorageUsed,
        totalAllocatedStorage,
        averageStoragePerUser: totalUsers > 0 ? Math.round(totalStorageUsed / totalUsers) : 0,
        averageInvoicesPerUser: totalUsers > 0 ? (totalInvoices / totalUsers).toFixed(1) : "0",
        storageDistribution: {
          under10MB: tierUnder10MB,
          from10to40MB: tier10to40MB,
          from40to100MB: tier40to100MB,
          over100MB: tierOver100MB,
        },
        topUsers,
      },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform stats: " + (error instanceof Error ? error.message : String(error)) },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
