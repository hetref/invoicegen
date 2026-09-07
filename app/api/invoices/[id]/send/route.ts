import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { r2Client } from "@/lib/r2-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { createCustomSmtpTransporter, formatSmtpError } from "@/lib/smtp-client";

export async function POST(
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
    const { recipientEmail, subject, message, senderName, replyTo, customSmtp } = body;

    if (!recipientEmail || !subject) {
      return NextResponse.json(
        { error: "Recipient email and subject are required" },
        { status: 400 }
      );
    }

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

    // Download invoice from R2
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: invoice.r2Key,
    });

    const response = await r2Client.send(command);
    const fileBuffer = Buffer.from(await response.Body!.transformToByteArray());

    // Verify that user has provided custom SMTP credentials
    if (
      !customSmtp ||
      !customSmtp.host ||
      !customSmtp.user ||
      !customSmtp.password ||
      !customSmtp.mailFrom
    ) {
      return NextResponse.json(
        {
          error:
            "Custom SMTP credentials not configured. Please configure your email SMTP credentials in your Profile page before sending invoices.",
        },
        { status: 400 }
      );
    }

    const fromAddress = customSmtp.mailFrom.trim();
    const portNumber = parseInt(customSmtp.port, 10) || (customSmtp.secure ? 465 : 587);

    // Create configured transport using shared client
    const transporter = createCustomSmtpTransporter({
      host: customSmtp.host,
      port: portNumber,
      secure: customSmtp.secure,
      user: customSmtp.user,
      password: customSmtp.password,
    });

    // Format sender address with display name if provided
    const cleanSenderName = (senderName || "").replace(/["<>]/g, "").trim();
    const senderAddress = cleanSenderName 
      ? `"${cleanSenderName}" <${fromAddress}>`
      : fromAddress;

    // Build HTML content with proper formatting
    const emailContent = message || `Dear recipient,\n\nPlease find the attached invoice ${invoice.fileName}.\n\nBest regards`;
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <div style="margin-bottom: 24px;">
          <p style="margin-bottom: 16px; white-space: pre-wrap; font-size: 14px;">${emailContent}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <div style="background-color: #f9f9f9; border: 1px solid #eaeaea; border-radius: 6px; padding: 12px; font-size: 12px; color: #555;">
          <p style="margin: 0;"><strong>Attached Invoice:</strong> ${invoice.fileName}</p>
        </div>
      </div>
    `;

    // Send email with invoice attachment
    const mailOptions = {
      from: senderAddress,
      to: recipientEmail.trim(),
      replyTo: replyTo ? replyTo.trim() : undefined,
      subject: subject.trim(),
      text: emailContent,
      html: htmlContent,
      attachments: [
        {
          filename: invoice.fileName,
          content: fileBuffer,
          contentType: invoice.mimeType || "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Invoice sent successfully",
      sentTo: recipientEmail.trim(),
    });
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    const friendlyError = formatSmtpError(error);

    return NextResponse.json(
      { error: friendlyError },
      { status: 500 }
    );
  }
}
