import nodemailer from "nodemailer";

export interface CustomSmtpOptions {
  host: string;
  port?: string | number;
  secure?: boolean;
  user: string;
  password: string;
  mailFrom?: string;
  senderName?: string;
  replyTo?: string;
}

/**
 * Creates a configured Nodemailer Transporter from user SMTP credentials.
 * Automatically handles Gmail service mapping, whitespace in app passwords,
 * and SSL/TLS port negotiation.
 */
export function createCustomSmtpTransporter(options: CustomSmtpOptions) {
  const host = (options.host || "").trim();
  const user = (options.user || "").trim();
  // Strip all whitespace from passwords (handles Google 16-char App Passwords with spaces like 'abcd efgh ijkl mnop')
  const password = (options.password || "").trim().replace(/\s+/g, "");
  const port = parseInt(String(options.port), 10) || (options.secure ? 465 : 587);

  const isGmail =
    host.toLowerCase().includes("gmail") ||
    user.toLowerCase().endsWith("@gmail.com") ||
    user.toLowerCase().endsWith("@googlemail.com");

  if (isGmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass: password,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: Boolean(options.secure) || port === 465,
    auth: {
      user,
      pass: password,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

/**
 * Formats friendly error messages from SMTP error codes.
 */
export function formatSmtpError(error: any): string {
  if (!error) return "An unexpected error occurred while communicating with the SMTP server.";

  const message = error.message || "";
  const code = error.code || "";
  const responseCode = error.responseCode;

  if (code === "EAUTH" || responseCode === 535 || message.includes("BadCredentials") || message.includes("535")) {
    return "SMTP Authentication failed: Invalid username or password. If using Gmail, Google requires a 16-character App Password (with 2FA enabled on your Google account), not your regular account password.";
  }

  if (code === "ETIMEDOUT" || code === "ESOCKET" || code === "ECONNECTION" || code === "ENOTFOUND") {
    return `Could not connect to SMTP server (${error.address || "host"}:${error.port || "port"}). Please verify the host address and port.`;
  }

  if (code === "EENVELOPE") {
    return "Invalid recipient or sender email address envelope. Please check the email format.";
  }

  return message || "Failed to send email via custom SMTP.";
}
