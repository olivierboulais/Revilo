const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL ?? "Revilo <noreply@revilo.design>";

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

// ─── Shared branded wrapper ───────────────────────────────────────────────────
function emailShell(content: string, footerNote: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Revilo</title>
</head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F4;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

        <!-- Logo bar -->
        <tr>
          <td style="background:#1C1C1A;border-radius:16px 16px 0 0;padding:24px 32px">
            <span style="font-size:15px;font-weight:700;letter-spacing:.08em;color:#F8F7F4">REVILO</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 32px">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F0EFEC;border-radius:0 0 16px 16px;padding:20px 32px">
            <p style="margin:0;font-size:11.5px;color:#9CA3AF;line-height:1.6">
              ${footerNote}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function primaryButton(href: string, label: string): string {
  return `<a href="${href}"
     style="display:inline-block;background:#1C1C1A;color:#F8F7F4;text-decoration:none;
            padding:13px 28px;border-radius:10px;font-size:14px;font-weight:500;
            letter-spacing:.01em;margin-top:8px">
    ${label} →
  </a>`;
}

// ─── Verify email ─────────────────────────────────────────────────────────────
export async function sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  if (!RESEND_API_KEY) {
    console.log(`[DEV] Verify email: ${verifyUrl}`);
    return;
  }

  const content = `
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:.06em;color:#C084FC;text-transform:uppercase">Welcome</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1C1C1A;line-height:1.3">Verify your email address</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.7">
      One quick step before you dive in — click the button below to confirm your email and activate your Revilo account.
      This link expires in <strong style="color:#1C1C1A">24 hours</strong>.
    </p>
    ${primaryButton(verifyUrl, "Verify my email")}
    <p style="margin:28px 0 0;font-size:13px;color:#9CA3AF;line-height:1.6">
      Or copy and paste this URL into your browser:<br/>
      <span style="color:#C084FC;word-break:break-all">${verifyUrl}</span>
    </p>
  `;

  const footer = `If you didn't create a Revilo account, you can safely ignore this email — no action is needed.`;

  const { Resend } = await import("resend");
  await new Resend(RESEND_API_KEY).emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verify your Revilo account",
    html: emailShell(content, footer),
  });
}

// ─── Password reset ───────────────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  if (!RESEND_API_KEY) {
    console.log(`[DEV] Reset password: ${resetUrl}`);
    return;
  }

  const content = `
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:.06em;color:#C084FC;text-transform:uppercase">Security</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1C1C1A;line-height:1.3">Reset your password</h1>
    <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.7">
      We received a request to reset your Revilo password. Click the button below to choose a new one.
      This link expires in <strong style="color:#1C1C1A">1 hour</strong>.
    </p>
    ${primaryButton(resetUrl, "Reset my password")}
    <p style="margin:28px 0 0;font-size:13px;color:#9CA3AF;line-height:1.6">
      Or copy and paste this URL into your browser:<br/>
      <span style="color:#C084FC;word-break:break-all">${resetUrl}</span>
    </p>
  `;

  const footer = `If you didn't request a password reset, you can safely ignore this email. Your password will not change.`;

  const { Resend } = await import("resend");
  await new Resend(RESEND_API_KEY).emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Reset your Revilo password",
    html: emailShell(content, footer),
  });
}
