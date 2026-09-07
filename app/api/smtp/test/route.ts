import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createCustomSmtpTransporter, formatSmtpError } from "@/lib/smtp-client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { host, port, secure, user, password, mailFrom } = body;

    if (!host || !user || !password || !mailFrom) {
      return NextResponse.json(
        { error: "Host, username/email, password, and mailFrom are required." },
        { status: 400 }
      );
    }

    const portNumber = parseInt(port, 10) || (secure ? 465 : 587);
    const startTime = Date.now();

    const transporter = createCustomSmtpTransporter({
      host,
      port: portNumber,
      secure,
      user,
      password,
    });

    // Verify SMTP connection and credentials
    await transporter.verify();
    const latencyMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      latencyMs,
      message: `Successfully connected and authenticated with ${host.trim()} (Port ${portNumber}).`,
    });
  } catch (error: any) {
    console.error("SMTP Test Connection error:", error);
    const friendlyError = formatSmtpError(error);

    return NextResponse.json(
      {
        success: false,
        error: friendlyError,
        rawCode: error.code,
      },
      { status: 400 }
    );
  }
}
