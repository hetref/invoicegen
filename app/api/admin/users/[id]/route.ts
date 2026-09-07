import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/admin-auth";

const DEFAULT_STORAGE_LIMIT = 40 * 1024 * 1024;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
    },
  });
}

// GET - Get single user details and invoice breakdown
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: {
          select: {
            providerId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        {
          status: 404,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: id },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        uploadedAt: true,
        isManuallyCreated: true,
        invoiceNumber: true,
        invoiceDate: true,
        totalAmount: true,
        groupId: true,
      },
    });

    const groups = await prisma.group.findMany({
      where: { userId: id },
      select: {
        id: true,
        name: true,
        parentId: true,
        createdAt: true,
      },
    });

    const storageLimit = Number(user.storageLimit ?? DEFAULT_STORAGE_LIMIT);
    const usedStorage = invoices.reduce((sum, inv) => sum + (inv.fileSize || 0), 0);
    const remainingStorage = Math.max(0, storageLimit - usedStorage);
    const percentUsed = storageLimit > 0
      ? parseFloat(((usedStorage / storageLimit) * 100).toFixed(2))
      : 0;

    return NextResponse.json(
      {
        user: {
          ...user,
          storageLimit,
        },
        stats: {
          storageLimit,
          usedStorage,
          remainingStorage,
          percentUsed,
          totalInvoices: invoices.length,
          uploadedInvoices: invoices.filter((i) => !i.isManuallyCreated).length,
          createdInvoices: invoices.filter((i) => i.isManuallyCreated).length,
          totalGroups: groups.length,
        },
        invoices,
        groups,
      },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    console.error("Error fetching user details in admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details: " + (error instanceof Error ? error.message : String(error)) },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}

// PATCH - Update user storage limit, invoice limit, or role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await req.json();

    const {
      storageLimit,
      storageLimitMB,
      storageLimitGB,
      maxInvoices,
      role,
      hasUsedFreeExtraction,
    } = body;

    let newStorageLimitBytes: number | null = null;
    if (storageLimit !== undefined) {
      newStorageLimitBytes = Math.round(Number(storageLimit));
    } else if (storageLimitMB !== undefined) {
      newStorageLimitBytes = Math.round(Number(storageLimitMB) * 1024 * 1024);
    } else if (storageLimitGB !== undefined) {
      newStorageLimitBytes = Math.round(Number(storageLimitGB) * 1024 * 1024 * 1024);
    }

    let parsedMaxInvoices: number | null = undefined as any;
    if (maxInvoices !== undefined) {
      parsedMaxInvoices = maxInvoices === null ? null : parseInt(String(maxInvoices), 10);
    }

    const updateData: any = {};
    if (newStorageLimitBytes !== null) {
      updateData.storageLimit = BigInt(newStorageLimitBytes);
    }
    if (parsedMaxInvoices !== undefined) {
      updateData.maxInvoices = parsedMaxInvoices;
    }
    if (role !== undefined) {
      updateData.role = role;
    }
    if (hasUsedFreeExtraction !== undefined) {
      updateData.hasUsedFreeExtraction = Boolean(hasUsedFreeExtraction);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storageLimit: true,
        maxInvoices: true,
        hasUsedFreeExtraction: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User limits updated successfully",
        user: {
          ...updatedUser,
          storageLimit: Number(updatedUser?.storageLimit ?? DEFAULT_STORAGE_LIMIT),
        },
      },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    console.error("Error updating user limits in admin:", error);
    return NextResponse.json(
      { error: "Failed to update user limits: " + (error instanceof Error ? error.message : String(error)) },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}
