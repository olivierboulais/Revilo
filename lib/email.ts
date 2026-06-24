const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL ?? "Revilo <noreply@revilo.app>";

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

export async function sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  if (!RESEND_API_KEY) {
    console.log(`[DEV] Verify email: ${verifyUrl}`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verify your Revilo account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Verify your email</h2>
        <p style="color:#6B7280;font-size:14px;margin-bottom:24px">
          Click the button below to verify your email and activate your Revilo account.
          The link expires in 24 hours.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#1C1C1A;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:10px;font-size:14px;font-weight:500">
          Verify email
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
          If you didn't create a Revilo account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  if (!RESEND_API_KEY) {
    console.log(`[DEV] Reset password: ${resetUrl}`);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(RESEND_API_KEY);

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your Revilo password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Reset your password</h2>
        <p style="color:#6B7280;font-size:14px;margin-bottom:24px">
          Click the button below to set a new password. The link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#1C1C1A;color:#fff;text-decoration:none;
                  padding:12px 24px;border-radius:10px;font-size:14px;font-weight:500">
          Reset password
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
