import nodemailer from "nodemailer";

// Create Gmail transporter
const createTransporter = () => {
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail SMTP credentials not configured");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Send email verification link to user
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
): Promise<void> {
  try {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              background-color: #3b82f6;
              color: white !important;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: #2563eb;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">InvoiceGen</div>
              <h2 style="color: #333; margin: 0;">Verify Your Email Address</h2>
            </div>
            
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>Thank you for signing up for InvoiceGen! To get started, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
              ${verificationUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Security Note:</strong> This verification link will expire in 1 hour. If you didn't create an account with InvoiceGen, please ignore this email.
            </div>
            
            <p>After verification, you'll be able to:</p>
            <ul>
              <li>✅ Upload and manage invoices</li>
              <li>✅ Create professional invoices</li>
              <li>✅ Extract data with AI</li>
              <li>✅ Organize with folders</li>
              <li>✅ Send invoices via email</li>
            </ul>
            
            <div class="footer">
              <p>This is an automated email from InvoiceGen.</p>
              <p>If you need help, visit our <a href="https://github.com/hetref/invoicegen">GitHub repository</a></p>
              <p style="margin-top: 10px;">
                <strong>InvoiceGen</strong> - Open Source Invoice Management<br>
                Self-hostable • AI-powered • Privacy-first
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Hi ${name},

Thank you for signing up for InvoiceGen!

To get started, please verify your email address by clicking the link below:
${verificationUrl}

This verification link will expire in 1 hour.

If you didn't create an account with InvoiceGen, please ignore this email.

---
InvoiceGen - Open Source Invoice Management
    `;

    await transporter.sendMail({
      from: `"InvoiceGen" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: "Verify Your Email - InvoiceGen",
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Email] Verification email sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send verification email to ${email}:`, error);
    throw new Error("Failed to send verification email");
  }
}

/**
 * Send password reset link to user
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<void> {
  try {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              background-color: #ef4444;
              color: white !important;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              background-color: #dc2626;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .warning {
              background-color: #fee2e2;
              border-left: 4px solid #ef4444;
              padding: 12px;
              margin: 20px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">InvoiceGen</div>
              <h2 style="color: #333; margin: 0;">Reset Your Password</h2>
            </div>
            
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>We received a request to reset your password for your InvoiceGen account. Click the button below to reset it:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Security Alert:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and ensure your account is secure.
            </div>
            
            <p><strong>Security Tips:</strong></p>
            <ul>
              <li>🔒 Use a strong, unique password</li>
              <li>🔑 Don't share your password with anyone</li>
              <li>🛡️ Enable two-factor authentication when available</li>
            </ul>
            
            <div class="footer">
              <p>This is an automated email from InvoiceGen.</p>
              <p>If you need help, visit our <a href="https://github.com/hetref/invoicegen">GitHub repository</a></p>
              <p style="margin-top: 10px;">
                <strong>InvoiceGen</strong> - Open Source Invoice Management<br>
                Self-hostable • AI-powered • Privacy-first
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Hi ${name},

We received a request to reset your password for your InvoiceGen account.

Click the link below to reset your password:
${resetUrl}

This password reset link will expire in 1 hour.

If you didn't request a password reset, please ignore this email and ensure your account is secure.

---
InvoiceGen - Open Source Invoice Management
    `;

    await transporter.sendMail({
      from: `"InvoiceGen Security" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: "Reset Your Password - InvoiceGen",
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Email] Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`[Email] Failed to send password reset email to ${email}:`, error);
    throw new Error("Failed to send password reset email");
  }
}

