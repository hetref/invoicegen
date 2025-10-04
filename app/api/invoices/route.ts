import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// GET - List all invoices for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ invoices });
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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, fileName, fileSize, mimeType, r2Key, groupId } = body;

    if (!id || !fileName || !fileSize || !mimeType || !r2Key) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    const invoice = await prisma.invoice.create({
      data: {
        id,
        userId: session.user.id,
        fileName,
        fileSize,
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
