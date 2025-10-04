import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// PATCH - Move invoice to a different group
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
    const { groupId } = body; // Can be null for root, or a group ID

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

    // If groupId is provided, verify it exists and belongs to the user
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group || group.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Group not found" },
          { status: 404 }
        );
      }
    }

    // Update the invoice's group
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { groupId: groupId || null },
    });

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error) {
    console.error("Error moving invoice:", error);
    return NextResponse.json(
      { error: "Failed to move invoice" },
      { status: 500 }
    );
  }
}

