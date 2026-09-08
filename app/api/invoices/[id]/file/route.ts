import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { getObjectFromR2 } from "@/lib/r2-client";
import { stampPdfWithPaid } from "@/lib/pdf-stamper";

// GET - Stream invoice file (inline for preview or attachment for download) with dynamic PAID stamp
export async function GET(
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

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Download original file buffer from R2
    const s3Response = await getObjectFromR2(invoice.r2Key);
    if (!s3Response.Body) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
    }

    const byteArray = await s3Response.Body.transformToByteArray();
    let fileBuffer = Buffer.from(byteArray);

    const isPaid = Boolean((invoice.paymentDetails as any)?.isPaid);
    const paidAt = (invoice.paymentDetails as any)?.paidAt;
    const isPdf = invoice.mimeType === "application/pdf" || invoice.fileName.toLowerCase().endsWith(".pdf");

    // If invoice is marked as PAID and document is a PDF, stamp the DevAlly verified stamp onto the PDF document itself
    if (isPaid && isPdf) {
      try {
        fileBuffer = await stampPdfWithPaid({
          pdfBuffer: fileBuffer,
          paidAt,
        });
      } catch (stampErr) {
        console.error("[PDF Stamper] Error stamping invoice with paid mark:", stampErr);
        // Fallback to original buffer if stamping fails
      }
    }

    const isDownload = req.nextUrl.searchParams.get("download") === "1";
    const fileName = invoice.fileName || `Invoice-${invoice.invoiceNumber || invoice.id}.pdf`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": invoice.mimeType || "application/pdf",
        "Content-Disposition": isDownload
          ? `attachment; filename="${encodeURIComponent(fileName)}"`
          : "inline",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("Error serving invoice file:", error);
    return NextResponse.json(
      { error: "Failed to retrieve invoice file" },
      { status: 500 }
    );
  }
}
