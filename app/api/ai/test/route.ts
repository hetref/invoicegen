import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { testAiConnection } from "@/lib/ai-client";
import { AiProvider } from "@/lib/ai-config";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { provider, apiKey, model } = body;

    if (!provider || (provider !== "gemini" && provider !== "groq")) {
      return NextResponse.json(
        { error: "Invalid AI provider specified. Choose 'gemini' or 'groq'." },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const result = await testAiConnection({
      provider: provider as AiProvider,
      apiKey: apiKey.trim(),
      model: model || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI connection test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to connect to AI provider",
      },
      { status: 400 }
    );
  }
}
