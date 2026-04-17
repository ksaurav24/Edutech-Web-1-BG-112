import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';
import { getForgotPasswordEmailHtml, getWelcomeEmailHtml } from './emailTemplates';

export interface WelcomeEmailInput {
  to: string;
  name: string;
}

export interface ForgotPasswordEmailInput {
  to: string;
  name: string;
  resetUrl: string;
}

let transporter: Transporter | null = null;

function ensureMailConfig(): void {
  const missingKeys = [ 
    ['SMTP_USER', env.smtpUser],
    ['SMTP_PASS', env.smtpPass],
  ].filter(([, value]) => !value);

  if (missingKeys.length) {
    const keys = missingKeys.map(([key]) => key).join(', ');
    throw new Error(`Missing email configuration: ${keys}`);
  }
}

function getTransporter(): Transporter {
  if (transporter) return transporter;
  ensureMailConfig();

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return transporter;
}

export async function sendWelcomeEmail({ to, name }: WelcomeEmailInput): Promise<void> {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: env.emailFrom,
    to,
    subject: 'Welcome to StudyPro',
    html: getWelcomeEmailHtml({ name }),
  });
  logger.info({ to }, 'email: welcome sent');
}

export async function sendForgotPasswordEmail({
  to,
  name,
  resetUrl,
}: ForgotPasswordEmailInput): Promise<void> {
  const mailer = getTransporter();
  await mailer.sendMail({
    from: env.emailFrom,
    to,
    subject: 'Reset your StudyPro password',
    html: getForgotPasswordEmailHtml({ name, resetUrl }),
  });
  logger.info({ to }, 'email: forgot password sent');
}
