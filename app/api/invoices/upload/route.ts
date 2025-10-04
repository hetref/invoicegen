import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUploadPresignedUrl } from "@/lib/r2-client";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

const STORAGE_LIMIT = 40 * 1024 * 1024; // 40 MB in bytes

// POST - Generate presigned URL for upload
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, contentType, fileSize } = body;

    if (!fileName || !contentType || !fileSize) {
      return NextResponse.json(
        { error: "fileName, contentType, and fileSize are required" },
        { status: 400 }
      );
    }

    // Check storage limit
    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      select: { fileSize: true },
    });

    const currentUsage = invoices.reduce((sum: number, inv) => sum + inv.fileSize, 0);
    
    if (currentUsage + fileSize > STORAGE_LIMIT) {
      const remainingMB = ((STORAGE_LIMIT - currentUsage) / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        { 
          error: "Storage limit exceeded", 
          message: `You have ${remainingMB} MB remaining. Your storage limit is 40 MB.`,
          currentUsage,
          storageLimit: STORAGE_LIMIT,
        },
        { status: 413 }
      );
    }

    // Validate file type (only allow PDF and images for invoices)
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF and images are allowed." },
        { status: 400 }
      );
    }

    const invoiceId = uuidv4();
    const r2Key = `${session.user.id}/${invoiceId}/${fileName}`;

    const uploadUrl = await getUploadPresignedUrl(r2Key, contentType);

    return NextResponse.json({
      uploadUrl,
      invoiceId,
      r2Key,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

