interface WelcomeTemplateInput {
  name: string;
}

interface ForgotPasswordTemplateInput {
  name: string;
  resetUrl: string;
}

export function getWelcomeEmailHtml({ name }: WelcomeTemplateInput): string {
  return `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #1e293b;">Welcome to StudyPro, ${name}!</h2>
        <p style="margin: 0 0 10px; color: #334155; line-height: 1.6;">
          Your account is ready. Start tracking study sessions, goals, and progress from your dashboard.
        </p>
        <p style="margin: 0; color: #334155; line-height: 1.6;">
          We are glad to have you with us.
        </p>
      </div>
    </div>
  `;
}

export function getForgotPasswordEmailHtml({
  name,
  resetUrl,
}: ForgotPasswordTemplateInput): string {
  return `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #1e293b;">Reset your password</h2>
        <p style="margin: 0 0 12px; color: #334155; line-height: 1.6;">
          Hi ${name}, we received a request to reset your StudyPro account password.
        </p>
        <a
          href="${resetUrl}"
          style="display: inline-block; margin: 8px 0 14px; padding: 10px 16px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px;"
        >
          Reset Password
        </a>
        <p style="margin: 0; color: #64748b; line-height: 1.6;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
}
