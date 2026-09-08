import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2-client";

// GET - Get a single invoice
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

    // Verify ownership
    if (invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isPaid = Boolean((invoice.paymentDetails as any)?.isPaid);
    const paidAt = (invoice.paymentDetails as any)?.paidAt || null;

    let extractionStatus = invoice.extractionStatus;
    // Auto-heal: If extracted fields are present in the database but status was wrongly set to failed due to email failure
    if (
      invoice.extractionStatus === "failed" &&
      (invoice.invoiceNumber || invoice.totalAmount || (Array.isArray(invoice.items) && invoice.items.length > 0))
    ) {
      extractionStatus = "completed";
      prisma.invoice
        .update({
          where: { id },
          data: { isExtracted: true, extractionStatus: "completed" },
        })
        .catch(() => {});
    }

    return NextResponse.json({
      invoice: {
        ...invoice,
        extractionStatus,
        isExtracted: extractionStatus === "completed" ? true : invoice.isExtracted,
        isPaid,
        paidAt,
      },
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PATCH - Update invoice status (e.g. toggle paid status)
export async function PATCH(
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
    const body = await req.json();
    const { isPaid } = body;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const currentPaymentDetails =
      typeof invoice.paymentDetails === "object" && invoice.paymentDetails !== null
        ? (invoice.paymentDetails as Record<string, any>)
        : {};

    const updatedPaymentDetails = {
      ...currentPaymentDetails,
      isPaid: Boolean(isPaid),
      paidAt: isPaid ? new Date().toISOString() : null,
    };

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        paymentDetails: updatedPaymentDetails,
      },
    });

    return NextResponse.json({
      success: true,
      invoice: {
        ...updatedInvoice,
        isPaid: Boolean(isPaid),
        paidAt: updatedPaymentDetails.paidAt,
      },
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    return NextResponse.json(
      { error: "Failed to update invoice status" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an invoice
export async function DELETE(
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

    // Delete from R2
    await deleteFromR2(invoice.r2Key);

    // Delete from database
    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
