import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET - Get user profile with statistics
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        lastLoginMethod: true,
        hasUsedFreeExtraction: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get invoice statistics
    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      select: {
        fileSize: true,
        uploadedAt: true,
        isManuallyCreated: true,
      },
    });

    const totalInvoices = invoices.length;
    const totalSize = invoices.reduce((sum: number, inv: typeof invoices[0]) => sum + inv.fileSize, 0);
    const uploadedInvoices = invoices.filter((inv: typeof invoices[0]) => !inv.isManuallyCreated).length;
    const createdInvoices = invoices.filter((inv: typeof invoices[0]) => inv.isManuallyCreated).length;

    // Get invoices this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const invoicesThisMonth = invoices.filter(
      (inv: typeof invoices[0]) => new Date(inv.uploadedAt) >= startOfMonth
    ).length;

    // Get total groups
    const totalGroups = await prisma.group.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      user,
      stats: {
        totalInvoices,
        totalSize,
        uploadedInvoices,
        createdInvoices,
        invoicesThisMonth,
        totalGroups,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    // Validate name
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(image !== undefined && { image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        lastLoginMethod: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
