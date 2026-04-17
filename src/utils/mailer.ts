import * as nodemailer from 'nodemailer';

/**
 * Singleton Nodemailer transporter configured from environment variables.
 * Supports any SMTP provider (Gmail, Brevo, Mailgun, etc.)
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g. smtp.gmail.com
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a transactional email.
 */
export async function sendMail({ to, subject, html }: SendMailOptions) {
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME ?? 'NestHome'}" <${process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
