import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { getUploadPresignedUrl, deleteFromR2 } from "@/lib/r2-client";

const DEFAULT_STORAGE_LIMIT = 40 * 1024 * 1024; // 40 MB default

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceData, groupId, invoiceId, estimatedFileSize } = body;

    if (!invoiceData || !invoiceData.invoiceNo || !invoiceData.items) {
      return NextResponse.json(
        { error: "Invalid invoice data provided" },
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

    // If invoiceId is provided, this is an edit operation
    let invoice;
    let oldR2Key: string | null = null;
    let oldFileSize = 0;

    if (invoiceId) {
      // Fetch existing invoice
      invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      if (invoice.userId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (!invoice.isManuallyCreated) {
        return NextResponse.json(
          { error: "Cannot edit uploaded invoices" },
          { status: 400 }
        );
      }

      oldR2Key = invoice.r2Key;
      oldFileSize = invoice.fileSize;
    } else {
      // If creating a brand new invoice, check maxInvoices count limit
      const currentCount = await prisma.invoice.count({
        where: { userId: session.user.id },
      });

      if (maxInvoices !== null && currentCount >= maxInvoices) {
        return NextResponse.json(
          {
            error: "Invoice limit reached",
            message: `You have reached your limit of ${maxInvoices} invoices. Please delete old invoices or request a limit upgrade.`,
            currentCount,
            maxInvoices,
          },
          { status: 403 }
        );
      }
    }

    // Check storage limit (exclude old file size if updating)
    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      select: { fileSize: true },
    });

    const currentUsage = invoices.reduce((sum: number, inv) => sum + (inv.fileSize || 0), 0) - oldFileSize;
    const estimatedSize = Math.max(0, Number(estimatedFileSize) || 500000); // Default ~500KB if not provided
    
    if (currentUsage + estimatedSize > storageLimit) {
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

    // Verify groupId ownership if provided
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });
      if (!group || group.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Invalid group specified" },
          { status: 400 }
        );
      }
    }

    const id = invoiceId || uuidv4();
    const fileName = `Invoice-${invoiceData.invoiceNo}.pdf`;
    const r2Key = `${session.user.id}/${id}/${fileName}`;

    // Calculate total amount
    const totalAmount = invoiceData.items.reduce(
      (sum: number, item: any) => sum + (Number(item.subtotal) || 0),
      0
    );

    // Transform invoice data to match database schema, securely binding to session.user.id
    const dbInvoiceData = {
      id,
      userId: session.user.id,
      fileName,
      fileSize: 0, // Will be updated after PDF upload
      mimeType: "application/pdf",
      r2Key,
      groupId: groupId || null,
      isManuallyCreated: true,
      isExtracted: true,
      extractionStatus: "completed",
      extractedAt: new Date(),
      invoiceDate: invoiceData.date,
      invoiceNumber: invoiceData.invoiceNo,
      billedToName: invoiceData.billedTo?.name || "",
      billedToAddress: invoiceData.billedTo?.address || "",
      billedToGst: invoiceData.billedTo?.gst || "",
      paymentToName: invoiceData.paymentTo?.name || "",
      paymentToAddress: invoiceData.paymentTo?.address || "",
      items: invoiceData.items,
      paymentDetails: {
        accountNumber: invoiceData.paymentDetails?.accountNumber || "",
        ifsc: invoiceData.paymentDetails?.ifsc || "",
        accountType: invoiceData.paymentDetails?.accountType || "",
        branch: invoiceData.paymentDetails?.branch || "",
        upi: invoiceData.paymentDetails?.upi || "",
      },
      contactInfo: {
        phone: invoiceData.contact?.phone || "",
        email: invoiceData.contact?.email || "",
        website: invoiceData.contact?.website || "",
      },
      totalAmount,
      currency: "INR",
    };

    // Get presigned URL for uploading the PDF
    const uploadUrl = await getUploadPresignedUrl(
      r2Key,
      "application/pdf",
      3600
    );

    return NextResponse.json({
      uploadUrl,
      invoiceData: dbInvoiceData,
      oldR2Key,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

// Confirm invoice creation after PDF upload
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceData, fileSize, oldR2Key } = body;

    const actualFileSize = Math.max(0, Number(fileSize) || 0);

    if (!invoiceData || !invoiceData.id) {
      return NextResponse.json(
        { error: "Missing invoiceData or invoice ID" },
        { status: 400 }
      );
    }

    // Fetch user limits from database with Prisma ORM
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        storageLimit: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const storageLimit = Number(user.storageLimit ?? DEFAULT_STORAGE_LIMIT);

    // Check existing usage excluding this specific invoice if it's already in DB
    const existingInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        id: { not: invoiceData.id },
      },
      select: { fileSize: true },
    });

    const currentUsageExcludingThis = existingInvoices.reduce(
      (sum: number, inv) => sum + (inv.fileSize || 0),
      0
    );

    if (currentUsageExcludingThis + actualFileSize > storageLimit) {
      return NextResponse.json(
        {
          error: "Storage limit exceeded",
          message: "Uploaded file exceeds your allocated storage limit.",
          storageLimit,
          currentUsage: currentUsageExcludingThis,
        },
        { status: 413 }
      );
    }

    // Force secure isolation: always set userId to the authenticated user ID
    invoiceData.userId = session.user.id;
    invoiceData.fileSize = actualFileSize;

    // Create or update invoice in database
    const invoice = await prisma.invoice.upsert({
      where: { id: invoiceData.id },
      update: {
        fileName: invoiceData.fileName,
        fileSize: actualFileSize,
        mimeType: invoiceData.mimeType || "application/pdf",
        r2Key: invoiceData.r2Key,
        groupId: invoiceData.groupId || null,
        isManuallyCreated: true,
        isExtracted: true,
        extractionStatus: "completed",
        extractedAt: new Date(),
        invoiceDate: invoiceData.invoiceDate,
        invoiceNumber: invoiceData.invoiceNumber,
        billedToName: invoiceData.billedToName,
        billedToAddress: invoiceData.billedToAddress,
        billedToGst: invoiceData.billedToGst,
        paymentToName: invoiceData.paymentToName,
        paymentToAddress: invoiceData.paymentToAddress,
        items: invoiceData.items,
        paymentDetails: invoiceData.paymentDetails,
        contactInfo: invoiceData.contactInfo,
        totalAmount: invoiceData.totalAmount,
        currency: invoiceData.currency || "INR",
      },
      create: {
        id: invoiceData.id,
        userId: session.user.id,
        fileName: invoiceData.fileName,
        fileSize: actualFileSize,
        mimeType: invoiceData.mimeType || "application/pdf",
        r2Key: invoiceData.r2Key,
        groupId: invoiceData.groupId || null,
        isManuallyCreated: true,
        isExtracted: true,
        extractionStatus: "completed",
        extractedAt: new Date(),
        invoiceDate: invoiceData.invoiceDate,
        invoiceNumber: invoiceData.invoiceNumber,
        billedToName: invoiceData.billedToName,
        billedToAddress: invoiceData.billedToAddress,
        billedToGst: invoiceData.billedToGst,
        paymentToName: invoiceData.paymentToName,
        paymentToAddress: invoiceData.paymentToAddress,
        items: invoiceData.items,
        paymentDetails: invoiceData.paymentDetails,
        contactInfo: invoiceData.contactInfo,
        totalAmount: invoiceData.totalAmount,
        currency: invoiceData.currency || "INR",
      },
    });

    // Delete old PDF if this was an edit
    if (oldR2Key && oldR2Key !== invoiceData.r2Key) {
      try {
        await deleteFromR2(oldR2Key);
      } catch (error) {
        console.error("Error deleting old PDF:", error);
      }
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error confirming invoice:", error);
    return NextResponse.json(
      { error: "Failed to save invoice" },
      { status: 500 }
    );
  }
}
