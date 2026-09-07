import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUploadPresignedUrl } from "@/lib/r2-client";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_STORAGE_LIMIT = 40 * 1024 * 1024; // 40 MB in bytes

// POST - Generate presigned URL for upload
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fileName, contentType, fileSize } = body;

    const parsedFileSize = Number(fileSize);

    if (!fileName || !contentType || !parsedFileSize || parsedFileSize <= 0) {
      return NextResponse.json(
        { error: "Valid fileName, contentType, and positive fileSize are required" },
        { status: 400 }
      );
    }

    // Fetch user limits from database with Prisma ORM
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

    // Check current storage usage and invoice count from DB
    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      select: { fileSize: true },
    });

    if (maxInvoices !== null && invoices.length >= maxInvoices) {
      return NextResponse.json(
        {
          error: "Invoice limit reached",
          message: `You have reached your limit of ${maxInvoices} invoices. Please delete old invoices or request a limit upgrade.`,
          currentCount: invoices.length,
          maxInvoices,
        },
        { status: 403 }
      );
    }

    const currentUsage = invoices.reduce((sum: number, inv) => sum + (inv.fileSize || 0), 0);

    if (currentUsage + parsedFileSize > storageLimit) {
      const remainingBytes = Math.max(0, storageLimit - currentUsage);
      const remainingMB = (remainingBytes / (1024 * 1024)).toFixed(2);
      const limitMB = (storageLimit / (1024 * 1024)).toFixed(2);

      return NextResponse.json(
        {
          error: "Storage limit exceeded",
          message: `You have ${remainingMB} MB remaining. Your storage limit is ${limitMB} MB.`,
          currentUsage,
          storageLimit,
          remainingStorage: remainingBytes,
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
        { error: "Invalid file type. Only PDF and images (PNG, JPEG, WebP) are allowed." },
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
