import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

const STORAGE_LIMIT = 40 * 1024 * 1024; // 40 MB in bytes

// GET - Check if user has storage available
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const newFileSizeStr = searchParams.get("fileSize");
    const newFileSize = newFileSizeStr ? parseInt(newFileSizeStr) : 0;

    // Get current storage usage
    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      select: { fileSize: true },
    });

    const currentUsage = invoices.reduce((sum, inv) => sum + inv.fileSize, 0);
    const remainingStorage = STORAGE_LIMIT - currentUsage;
    const wouldExceed = currentUsage + newFileSize > STORAGE_LIMIT;

    return NextResponse.json({
      currentUsage,
      storageLimit: STORAGE_LIMIT,
      remainingStorage,
      canUpload: !wouldExceed,
      wouldExceed,
      percentUsed: ((currentUsage / STORAGE_LIMIT) * 100).toFixed(2),
    });
  } catch (error) {
    console.error("Error checking storage:", error);
    return NextResponse.json(
      { error: "Failed to check storage" },
      { status: 500 }
    );
  }
}

