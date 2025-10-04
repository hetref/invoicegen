import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@/lib/generated/prisma";
import { r2Client } from "@/lib/r2-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

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

    // Configure SMTP transporter
    let transporter;
    let fromAddress;
    
    if (customSmtp && customSmtp.host && customSmtp.user && customSmtp.password && customSmtp.mailFrom) {
      // Use custom SMTP settings from user
      transporter = nodemailer.createTransport({
        host: customSmtp.host,
        port: customSmtp.port || 587,
        secure: customSmtp.secure || false,
        auth: {
          user: customSmtp.user,
          pass: customSmtp.password,
        },
      });
      fromAddress = customSmtp.mailFrom;
    } else {
      // Use default Gmail SMTP
      if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
        return NextResponse.json(
          { error: "SMTP configuration not found. Please add custom SMTP settings in your profile." },
          { status: 500 }
        );
      }

      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      fromAddress = process.env.GMAIL_EMAIL;
    }

    // Format sender address with display name if provided
    const senderAddress = senderName 
      ? `"${senderName}" <${fromAddress}>`
      : fromAddress;

    // Build HTML content with proper formatting
    const emailContent = message || `Dear recipient,\n\nPlease find the attached invoice ${invoice.fileName}.\n\nBest regards`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p style="margin-bottom: 20px;">${emailContent.replace(/\n/g, '<br>')}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; margin-bottom: 0;">
          Please find the invoice <strong>${invoice.fileName}</strong> attached to this email.
        </p>
      </div>
    `;

    // Send email with invoice attachment
    const mailOptions = {
      from: senderAddress,
      to: recipientEmail,
      replyTo: replyTo || undefined,
      subject: subject,
      text: emailContent,
      html: htmlContent,
      attachments: [
        {
          filename: invoice.fileName,
          content: fileBuffer,
          contentType: invoice.mimeType,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "Invoice sent successfully",
      sentTo: recipientEmail,
    });
  } catch (error: any) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send invoice" },
      { status: 500 }
    );
  }
}
