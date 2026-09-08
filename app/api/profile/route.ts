import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const DEFAULT_STORAGE_LIMIT = 40 * 1024 * 1024; // 40 MB default

// GET - Get user profile with statistics
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user details with Prisma ORM
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
        aiProvider: true,
        geminiApiKey: true,
        geminiModel: true,
        groqApiKey: true,
        groqModel: true,
        storageLimit: true,
        maxInvoices: true,
        role: true,
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
    const totalSize = invoices.reduce((sum: number, inv: { fileSize: number }) => sum + (inv.fileSize || 0), 0);
    const uploadedInvoices = invoices.filter((inv: { isManuallyCreated: boolean }) => !inv.isManuallyCreated).length;
    const createdInvoices = invoices.filter((inv: { isManuallyCreated: boolean }) => inv.isManuallyCreated).length;

    // Get invoices this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const invoicesThisMonth = invoices.filter(
      (inv: { uploadedAt: Date }) => new Date(inv.uploadedAt) >= startOfMonth
    ).length;

    // Get total groups
    const totalGroups = await prisma.group.count({
      where: { userId: session.user.id },
    });

    const storageLimit = Number(user.storageLimit ?? DEFAULT_STORAGE_LIMIT);
    const remainingStorage = Math.max(0, storageLimit - totalSize);
    const percentUsed = storageLimit > 0
      ? Math.min(100, (totalSize / storageLimit) * 100).toFixed(2)
      : "0.00";

    const logoUrl = user.image
      ? user.image.startsWith("http://") || user.image.startsWith("https://")
        ? user.image
        : "/api/profile/logo"
      : null;

    return NextResponse.json({
      user: {
        ...user,
        logoUrl,
        hasLogo: Boolean(user.image),
        storageLimit,
      },
      aiConfig: {
        aiProvider: user.aiProvider || "gemini",
        geminiApiKey: user.geminiApiKey || "",
        geminiModel: user.geminiModel || "gemini-2.5-flash",
        groqApiKey: user.groqApiKey || "",
        groqModel: user.groqModel || "llama-3.3-70b-versatile",
        hasGeminiKey: Boolean(user.geminiApiKey),
        hasGroqKey: Boolean(user.groqApiKey),
      },
      stats: {
        totalInvoices,
        totalSize,
        storageLimit,
        remainingStorage,
        percentUsed,
        maxInvoices: user.maxInvoices,
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

// PATCH - Update user profile (profile and AI configuration fields)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      image,
      aiProvider,
      geminiApiKey,
      geminiModel,
      groqApiKey,
      groqModel,
    } = body;

    // Strict validation for name if provided
    if (name !== undefined && (!name || typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json(
        { error: "Name cannot be empty" },
        { status: 400 }
      );
    }

    const dataToUpdate: {
      name?: string;
      image?: string | null;
      aiProvider?: string;
      geminiApiKey?: string | null;
      geminiModel?: string;
      groqApiKey?: string | null;
      groqModel?: string;
    } = {};

    if (name !== undefined) dataToUpdate.name = name.trim();
    if (image !== undefined) dataToUpdate.image = typeof image === "string" ? image : null;

    if (aiProvider !== undefined && (aiProvider === "gemini" || aiProvider === "groq")) {
      dataToUpdate.aiProvider = aiProvider;
    }

    if (geminiApiKey !== undefined) {
      dataToUpdate.geminiApiKey =
        typeof geminiApiKey === "string" && geminiApiKey.trim().length > 0
          ? geminiApiKey.trim()
          : null;
    }

    if (geminiModel !== undefined && typeof geminiModel === "string" && geminiModel.trim().length > 0) {
      dataToUpdate.geminiModel = geminiModel.trim();
    }

    if (groqApiKey !== undefined) {
      dataToUpdate.groqApiKey =
        typeof groqApiKey === "string" && groqApiKey.trim().length > 0
          ? groqApiKey.trim()
          : null;
    }

    if (groqModel !== undefined && typeof groqModel === "string" && groqModel.trim().length > 0) {
      dataToUpdate.groqModel = groqModel.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        lastLoginMethod: true,
        hasUsedFreeExtraction: true,
        aiProvider: true,
        geminiApiKey: true,
        geminiModel: true,
        groqApiKey: true,
        groqModel: true,
        storageLimit: true,
        maxInvoices: true,
        role: true,
      },
    });

    return NextResponse.json({
      user: {
        ...updatedUser,
        storageLimit: Number(updatedUser?.storageLimit ?? DEFAULT_STORAGE_LIMIT),
      },
      aiConfig: {
        aiProvider: updatedUser.aiProvider || "gemini",
        geminiApiKey: updatedUser.geminiApiKey || "",
        geminiModel: updatedUser.geminiModel || "gemini-2.5-flash",
        groqApiKey: updatedUser.groqApiKey || "",
        groqModel: updatedUser.groqModel || "llama-3.3-70b-versatile",
        hasGeminiKey: Boolean(updatedUser.geminiApiKey),
        hasGroqKey: Boolean(updatedUser.groqApiKey),
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
