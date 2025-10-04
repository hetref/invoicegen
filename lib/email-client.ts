import nodemailer from "nodemailer";

if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
  throw new Error("Gmail credentials are not configured");
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send invoice extraction completion email
 */
export async function sendExtractionCompleteEmail(
  to: string,
  invoiceFileName: string,
  status: "success" | "failed",
  invoiceId: string
) {
  const subject =
    status === "success"
      ? "✅ Invoice Extraction Complete"
      : "❌ Invoice Extraction Failed";

  const htmlContent =
    status === "success"
      ? `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Extraction Complete!</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Great news! Your invoice <strong>${invoiceFileName}</strong> has been successfully processed and all data has been extracted.</p>
          <p>You can now view the extracted information in your dashboard.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invoices/${invoiceId}" class="button">View Invoice</a>
        </div>
        <div class="footer">
          <p>This is an automated message from Invoice Generator</p>
        </div>
      </div>
    </body>
    </html>
  `
      : `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Extraction Failed</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>Unfortunately, we encountered an issue while processing your invoice <strong>${invoiceFileName}</strong>.</p>
          <p>Please try again or contact support if the issue persists.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invoices/${invoiceId}" class="button">View Invoice</a>
        </div>
        <div class="footer">
          <p>This is an automated message from Invoice Generator</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Invoice Generator" <${process.env.GMAIL_EMAIL}>`,
    to,
    subject,
    html: htmlContent,
  });
}



