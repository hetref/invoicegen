import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/lib/generated/prisma";
import { v4 as uuidv4 } from "uuid";
import { getUploadPresignedUrl, deleteFromR2 } from "@/lib/r2-client";

const prisma = new PrismaClient();
const STORAGE_LIMIT = 40 * 1024 * 1024; // 40 MB in bytes

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceData, groupId, invoiceId, estimatedFileSize } = body;

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
    }

    // Check storage limit (exclude old file size if updating)
    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      select: { fileSize: true },
    });

    const currentUsage = invoices.reduce((sum, inv) => sum + inv.fileSize, 0) - oldFileSize;
    const estimatedSize = estimatedFileSize || 500000; // Default 500KB if not provided
    
    if (currentUsage + estimatedSize > STORAGE_LIMIT) {
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

    const id = invoiceId || uuidv4();
    const fileName = `Invoice-${invoiceData.invoiceNo}.pdf`;
    const r2Key = `${session.user.id}/${id}/${fileName}`;

    // Calculate total amount
    const totalAmount = invoiceData.items.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0
    );

    // Transform invoice data to match database schema
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
      billedToName: invoiceData.billedTo.name,
      billedToAddress: invoiceData.billedTo.address,
      billedToGst: invoiceData.billedTo.gst,
      paymentToName: invoiceData.paymentTo.name,
      paymentToAddress: invoiceData.paymentTo.address,
      items: invoiceData.items,
      paymentDetails: {
        accountNumber: invoiceData.paymentDetails.accountNumber,
        ifsc: invoiceData.paymentDetails.ifsc,
        accountType: invoiceData.paymentDetails.accountType,
        branch: invoiceData.paymentDetails.branch,
        upi: invoiceData.paymentDetails.upi,
      },
      contactInfo: {
        phone: invoiceData.contact.phone,
        email: invoiceData.contact.email,
        website: invoiceData.contact.website,
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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceData, fileSize, oldR2Key } = body;

    // Update file size
    invoiceData.fileSize = fileSize;

    // Create or update invoice in database
    const invoice = await prisma.invoice.upsert({
      where: { id: invoiceData.id },
      update: invoiceData,
      create: invoiceData,
    });

    // Delete old PDF if this was an edit
    if (oldR2Key && oldR2Key !== invoiceData.r2Key) {
      try {
        await deleteFromR2(oldR2Key);
      } catch (error) {
        console.error("Error deleting old PDF:", error);
        // Continue even if deletion fails
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
