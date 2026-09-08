import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const DEFAULT_STORAGE_LIMIT = 40 * 1024 * 1024; // 40 MB default

// GET - List all invoices for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: "desc" },
    });

    const mappedInvoices = invoices.map((inv) => ({
      ...inv,
      isPaid: Boolean((inv.paymentDetails as any)?.isPaid),
      paidAt: (inv.paymentDetails as any)?.paidAt || null,
    }));

    return NextResponse.json({ invoices: mappedInvoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST - Create invoice metadata after successful upload
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, fileName, fileSize, mimeType, r2Key, groupId } = body;

    const parsedFileSize = Number(fileSize);

    if (!id || !fileName || !parsedFileSize || parsedFileSize <= 0 || !mimeType || !r2Key) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Security check: r2Key must be scoped to the authenticated user's ID
    if (!r2Key.startsWith(`${session.user.id}/`)) {
      return NextResponse.json(
        { error: "Forbidden: Storage key mismatch" },
        { status: 403 }
      );
    }

    // Fetch user limits from DB
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

    // Check count and storage limits
    const existingInvoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      select: { fileSize: true },
    });

    if (maxInvoices !== null && existingInvoices.length >= maxInvoices) {
      return NextResponse.json(
        { error: "Invoice count limit reached" },
        { status: 403 }
      );
    }

    const currentUsage = existingInvoices.reduce((sum: number, inv) => sum + inv.fileSize, 0);
    if (currentUsage + parsedFileSize > storageLimit) {
      return NextResponse.json(
        { error: "Storage limit exceeded" },
        { status: 413 }
      );
    }

    // If groupId is provided, verify it exists and belongs to the user
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group || group.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Group not found or unauthorized" },
          { status: 404 }
        );
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        id,
        userId: session.user.id,
        fileName,
        fileSize: parsedFileSize,
        mimeType,
        r2Key,
        groupId: groupId || null,
      },
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
