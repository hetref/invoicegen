import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/lib/generated/prisma";
import { r2Client } from "@/lib/r2-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { extractInvoiceData } from "@/lib/gemini-client";
import { sendExtractionCompleteEmail } from "@/lib/email-client";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Try to parse body, but handle empty body gracefully
    let userApiKey: string | undefined;
    try {
      const body = await req.json();
      userApiKey = body.userApiKey;
    } catch (error) {
      // Body might be empty, that's okay
      userApiKey = undefined;
    }

    // Get user to check if they've used free extraction
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasUsedFreeExtraction: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has API key or has free extraction available
    if (!userApiKey && user.hasUsedFreeExtraction) {
      return NextResponse.json(
        { 
          error: "API key required",
          message: "You have used your free AI extraction. Please add your Gemini API key in the profile page for unlimited extractions.",
        },
        { status: 403 }
      );
    }

    // Find the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Verify ownership
    if (invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if already extracted
    if (invoice.isExtracted) {
      return NextResponse.json(
        { error: "Invoice already extracted" },
        { status: 400 }
      );
    }

    // Update status to processing
    await prisma.invoice.update({
      where: { id },
      data: {
        extractionStatus: "processing",
      },
    });

    // Mark free extraction as used if no API key provided
    if (!userApiKey && !user.hasUsedFreeExtraction) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { hasUsedFreeExtraction: true },
      });
    }

    // Start background extraction process (don't await)
    processExtraction(
      id, 
      invoice.r2Key, 
      invoice.mimeType, 
      session.user.email, 
      invoice.fileName,
      userApiKey || process.env.GEMINI_API_KEY || "" // Use user's API key or fallback to env
    ).catch(
      (error) => {
        console.error("Background extraction error:", error);
      }
    );

    return NextResponse.json({
      message: "Extraction started. You will receive an email when complete.",
      status: "processing",
    });
  } catch (error) {
    console.error("Error starting extraction:", error);
    return NextResponse.json(
      { error: "Failed to start extraction" },
      { status: 500 }
    );
  }
}

// Background extraction process
async function processExtraction(
  invoiceId: string,
  r2Key: string,
  mimeType: string,
  userEmail: string,
  fileName: string,
  apiKey: string
) {
  try {
    console.log(`[Extraction] Starting for invoice ${invoiceId}`);

    // Download file from R2
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: r2Key,
    });

    const response = await r2Client.send(command);
    const fileBuffer = Buffer.from(await response.Body!.transformToByteArray());

    console.log(`[Extraction] Downloaded file from R2`);

    // Extract data using Gemini with user's API key
    const extractedData = await extractInvoiceData(fileBuffer, mimeType, apiKey);

    console.log(`[Extraction] Data extracted successfully`);

    // Save extracted data to database
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        isExtracted: true,
        extractionStatus: "completed",
        extractedAt: new Date(),
        invoiceDate: extractedData.invoiceDate,
        invoiceNumber: extractedData.invoiceNumber,
        billedToName: extractedData.billedToName,
        billedToAddress: extractedData.billedToAddress,
        billedToGst: extractedData.billedToGst,
        paymentToName: extractedData.paymentToName,
        paymentToAddress: extractedData.paymentToAddress,
        items: extractedData.items,
        paymentDetails: extractedData.paymentDetails,
        contactInfo: extractedData.contactInfo,
        totalAmount: extractedData.totalAmount,
        currency: extractedData.currency || "INR",
      },
    });

    console.log(`[Extraction] Data saved to database`);

    // Send success email
    await sendExtractionCompleteEmail(userEmail, fileName, "success", invoiceId);

    console.log(`[Extraction] Success email sent to ${userEmail}`);
  } catch (error) {
    console.error(`[Extraction] Failed for invoice ${invoiceId}:`, error);

    // Update status to failed
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        extractionStatus: "failed",
      },
    });

    // Send failure email
    try {
      await sendExtractionCompleteEmail(userEmail, fileName, "failed", invoiceId);
    } catch (emailError) {
      console.error("[Extraction] Failed to send failure email:", emailError);
    }
  }
}
