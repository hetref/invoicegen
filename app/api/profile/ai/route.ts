import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET - Retrieve saved AI configuration for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        aiProvider: true,
        geminiApiKey: true,
        geminiModel: true,
        groqApiKey: true,
        groqModel: true,
        hasUsedFreeExtraction: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      aiConfig: {
        aiProvider: user.aiProvider || "gemini",
        geminiApiKey: user.geminiApiKey || "",
        geminiModel: user.geminiModel || "gemini-2.5-flash",
        groqApiKey: user.groqApiKey || "",
        groqModel: user.groqModel || "llama-3.3-70b-versatile",
        hasGeminiKey: Boolean(user.geminiApiKey),
        hasGroqKey: Boolean(user.groqApiKey),
        hasUsedFreeExtraction: user.hasUsedFreeExtraction,
      },
    });
  } catch (error) {
    console.error("Error fetching AI configuration:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI configuration" },
      { status: 500 }
    );
  }
}

// POST/PATCH - Save or update AI configuration in database
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      aiProvider,
      geminiApiKey,
      geminiModel,
      groqApiKey,
      groqModel,
    } = body;

    const updateData: {
      aiProvider?: string;
      geminiApiKey?: string | null;
      geminiModel?: string;
      groqApiKey?: string | null;
      groqModel?: string;
    } = {};

    if (aiProvider !== undefined) {
      if (aiProvider === "gemini" || aiProvider === "groq") {
        updateData.aiProvider = aiProvider;
      }
    }

    if (geminiApiKey !== undefined) {
      updateData.geminiApiKey =
        typeof geminiApiKey === "string" && geminiApiKey.trim().length > 0
          ? geminiApiKey.trim()
          : null;
    }

    if (geminiModel !== undefined && typeof geminiModel === "string" && geminiModel.trim().length > 0) {
      updateData.geminiModel = geminiModel.trim();
    }

    if (groqApiKey !== undefined) {
      updateData.groqApiKey =
        typeof groqApiKey === "string" && groqApiKey.trim().length > 0
          ? groqApiKey.trim()
          : null;
    }

    if (groqModel !== undefined && typeof groqModel === "string" && groqModel.trim().length > 0) {
      updateData.groqModel = groqModel.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        aiProvider: true,
        geminiApiKey: true,
        geminiModel: true,
        groqApiKey: true,
        groqModel: true,
        hasUsedFreeExtraction: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "AI configuration saved successfully to database",
      aiConfig: {
        aiProvider: updatedUser.aiProvider || "gemini",
        geminiApiKey: updatedUser.geminiApiKey || "",
        geminiModel: updatedUser.geminiModel || "gemini-2.5-flash",
        groqApiKey: updatedUser.groqApiKey || "",
        groqModel: updatedUser.groqModel || "llama-3.3-70b-versatile",
        hasGeminiKey: Boolean(updatedUser.geminiApiKey),
        hasGroqKey: Boolean(updatedUser.groqApiKey),
        hasUsedFreeExtraction: updatedUser.hasUsedFreeExtraction,
      },
    });
  } catch (error) {
    console.error("Error updating AI configuration:", error);
    return NextResponse.json(
      { error: "Failed to save AI configuration" },
      { status: 500 }
    );
  }
}
