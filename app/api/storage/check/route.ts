import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const DEFAULT_STORAGE_LIMIT = 40 * 1024 * 1024; // 40 MB default

// GET - Check if user has storage available
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const newFileSizeStr = searchParams.get("fileSize");
    const newFileSize = newFileSizeStr ? parseInt(newFileSizeStr, 10) : 0;

    // Fetch user limits with Prisma ORM
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        storageLimit: true,
        maxInvoices: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const storageLimit = Number(user.storageLimit ?? DEFAULT_STORAGE_LIMIT);
    const maxInvoices = user.maxInvoices ?? null;

    // Get current storage usage and invoice count with Prisma ORM
    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      select: { fileSize: true },
    });

    const currentUsage = invoices.reduce((sum: number, inv) => sum + (inv.fileSize || 0), 0);
    const invoiceCount = invoices.length;
    const remainingStorage = Math.max(0, storageLimit - currentUsage);
    const wouldExceedStorage = currentUsage + newFileSize > storageLimit;
    const wouldExceedInvoices = maxInvoices !== null && invoiceCount >= maxInvoices;
    const canUpload = !wouldExceedStorage && !wouldExceedInvoices;

    const percentUsed = storageLimit > 0
      ? Math.min(100, (currentUsage / storageLimit) * 100).toFixed(2)
      : "0.00";

    return NextResponse.json({
      currentUsage,
      storageLimit,
      remainingStorage,
      canUpload,
      wouldExceed: wouldExceedStorage,
      wouldExceedInvoices,
      invoiceCount,
      maxInvoices,
      percentUsed,
    });
  } catch (error) {
    console.error("Error checking storage:", error);
    return NextResponse.json(
      { error: "Failed to check storage" },
      { status: 500 }
    );
  }
}
