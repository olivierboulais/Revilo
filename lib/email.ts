const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL ?? "Revilo <noreply@revilo.design>";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://revilo.design";

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

// ─── Shared pieces ────────────────────────────────────────────────────────────

const WORDMARK = (prefix: string) => `
<svg width="88" height="27" viewBox="0 0 169 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="REVILO">
  <mask id="${prefix}m0" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="23" height="52"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H22.1756V51.696H0V0Z" fill="white"/></mask>
  <g mask="url(#${prefix}m0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.456 21.5995V8.85651C21.456 2.95251 18.816-.000488281 13.536-.000488281H0V51.6965H6.912V6.26351H11.448C13.512 6.26351 14.544 7.51251 14.544 10.0075V24.9125H11.448H9.819L11.602 33.1785 15.624 51.6965H22.176L17.352 30.1675C20.088 28.9685 21.456 26.1125 21.456 21.5995Z" fill="#1C1C1A"/></g>
  <mask id="${prefix}m1" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="34" y="0" width="18" height="52"><path fill-rule="evenodd" clip-rule="evenodd" d="M34.4141.000244141H51.5501V51.696H34.4141V.000244141Z" fill="white"/></mask>
  <g mask="url(#${prefix}m1)"><path fill-rule="evenodd" clip-rule="evenodd" d="M34.4141 51.6962H51.5501V45.4312H41.3261V28.2232H50.3981V21.9602H41.3261V6.26324H51.5501V.000244141H34.4141V51.6962Z" fill="#1C1C1A"/></g>
  <mask id="${prefix}m2" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="61" y="0" width="26" height="52"><path fill-rule="evenodd" clip-rule="evenodd" d="M61.1953 0H86.1073V51.6959H61.1953V0Z" fill="white"/></mask>
  <g mask="url(#${prefix}m2)"><path fill-rule="evenodd" clip-rule="evenodd" d="M73.6513 39.456L68.0353 0H61.1953L69.5473 51.696H77.7553L86.1073 0H79.2673L73.6513 39.456Z" fill="#1C1C1A"/></g>
  <mask id="${prefix}m3" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="169" height="52"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 51.696H168.262V0H0V51.696Z" fill="white"/></mask>
  <g mask="url(#${prefix}m3)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M97.2734 51.696H104.185V0H97.2734V51.696Z" fill="#1C1C1A"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M124.771 0H117.859V51.696H134.275V45.432H124.771V0Z" fill="#1C1C1A"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M161.348 42.412C161.348 44.422 160.438 45.432 158.608 45.432H155.078C153.018 45.432 151.989 44.422 151.989 42.412V9.292C151.989 7.272 152.998 6.262 155.008 6.262H158.248C160.308 6.262 161.348 7.272 161.348 9.292V42.412ZM159.978.002H153.358C147.838.002 145.078 2.952 145.078 8.851V42.912C145.078 48.771 147.858 51.691 153.428 51.691H159.909C165.478 51.691 168.258 48.771 168.258 42.912V8.851C168.258 2.952 165.498.002 159.978.002Z" fill="#1C1C1A"/>
  </g>
</svg>`;

const PILL_BTN = (href: string, label: string) => `
<table cellpadding="0" cellspacing="0">
  <tr>
    <td style="background:#1C1C1A;border-radius:999px">
      <a href="${href}" style="display:inline-block;padding:12px 24px;text-decoration:none;font-size:13.5px;font-weight:500;color:#ffffff;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Helvetica,Arial,sans-serif">
        ${label}
      </a>
    </td>
  </tr>
</table>`;

const LINK_FALLBACK = (url: string) => `
<p style="margin:18px 0 0;font-size:11.5px;color:#B4B2A9;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Helvetica,Arial,sans-serif">
  Or paste this link: <a href="${url}" style="color:#C084FC;word-break:break-all;text-decoration:none">${url}</a>
</p>`;

function shell(wordmarkHtml: string, heroHtml: string, bodyHtml: string, footerHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Revilo</title></head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F4;padding:36px 16px 52px">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
    <tr><td style="padding:0 4px 24px">${wordmarkHtml}</td></tr>
    <tr><td style="background:#ffffff;border-radius:20px;border:1px solid rgba(28,28,26,.1);overflow:hidden">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td>${heroHtml}</td></tr>
        <tr><td style="padding:32px 36px 28px">${bodyHtml}</td></tr>
        <tr><td style="background:#F8F7F4;border-top:1px solid rgba(28,28,26,.08);padding:18px 36px;border-radius:0 0 20px 20px">
          <p style="margin:0;font-size:11.5px;color:#9CA3AF;line-height:1.6">${footerHtml}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </td></tr>
</table>
</body></html>`;
}

// ─── Verify email ─────────────────────────────────────────────────────────────
// Hero: Figma card ↔ synced beam ↔ GitHub card

const VERIFY_HERO = `
<div style="background:radial-gradient(ellipse 80% 90% at 15% 10%,#EFD9FF 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 85% 90%,#A78BFA33 0%,transparent 55%),#DBC8FF;padding:48px 32px">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <!-- Figma card -->
      <td align="center" valign="middle" width="33%">
        <div style="background:#fff;border-radius:16px;padding:20px 16px;display:inline-block;box-shadow:0 8px 28px rgba(124,58,237,.16);text-align:center">
          <svg width="34" height="50" viewBox="0 0 34 50" fill="none" style="display:block;margin:0 auto 10px">
            <rect x="0" y="0" width="17" height="17" rx="8.5" fill="#FF7262"/>
            <rect x="17" y="0" width="17" height="17" rx="8.5" fill="#FF7262"/>
            <rect x="0" y="17" width="17" height="17" rx="8.5" fill="#A259FF"/>
            <rect x="17" y="17" width="17" height="17" rx="8.5" fill="#1ABCFE"/>
            <rect x="0" y="34" width="17" height="17" rx="8.5" fill="#0ACF83"/>
          </svg>
          <div style="font-size:9.5px;font-weight:700;letter-spacing:.09em;color:#B4B2A9;font-family:-apple-system,BlinkMacSystemFont,sans-serif">FIGMA</div>
        </div>
      </td>

      <!-- Beam connector -->
      <td align="center" valign="middle" width="34%">
        <svg width="120" height="44" viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto">
          <line x1="8" y1="22" x2="112" y2="22" stroke="#C084FC" stroke-width="2" stroke-dasharray="5 4" stroke-opacity="0.6"/>
          <circle cx="60" cy="22" r="14" fill="#7C3AED"/>
          <polyline points="53,22 58,27.5 67,16" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div style="font-size:9px;font-weight:700;letter-spacing:.1em;color:#7C3AED;text-align:center;margin-top:6px;font-family:-apple-system,BlinkMacSystemFont,sans-serif">SYNCED</div>
      </td>

      <!-- GitHub card -->
      <td align="center" valign="middle" width="33%">
        <div style="background:#1C1C1A;border-radius:16px;padding:20px 16px;display:inline-block;box-shadow:0 8px 28px rgba(0,0,0,.2);text-align:center">
          <svg width="36" height="36" viewBox="0 0 98 96" fill="none" style="display:block;margin:0 auto 10px">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="white" opacity=".85"/>
          </svg>
          <div style="font-size:9.5px;font-weight:700;letter-spacing:.09em;color:rgba(255,255,255,.4);font-family:-apple-system,BlinkMacSystemFont,sans-serif">GITHUB</div>
        </div>
      </td>
    </tr>
  </table>
</div>`;

// ─── Password reset ───────────────────────────────────────────────────────────
// Hero: OLD PASSWORD card → arrow → NEW PASSWORD card

const RESET_HERO = `
<div style="background:radial-gradient(ellipse 80% 90% at 15% 10%,#EFD9FF 0%,transparent 60%),radial-gradient(ellipse 60% 60% at 85% 90%,#A78BFA33 0%,transparent 55%),#DBC8FF;padding:44px 28px">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <!-- Old password card -->
      <td align="center" valign="middle" width="42%">
        <div style="background:#fff;border-radius:16px;padding:20px 18px;display:inline-block;box-shadow:0 8px 28px rgba(124,58,237,.14);text-align:left;width:130px">
          <div style="font-size:9px;font-weight:700;letter-spacing:.1em;color:#B4B2A9;margin-bottom:14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif">OLD PASSWORD</div>
          <div style="background:#F0EFEC;border-radius:99px;height:9px;width:70%;margin-bottom:8px"></div>
          <div style="background:#F0EFEC;border-radius:99px;height:9px;width:45%;margin-bottom:8px"></div>
          <div style="background:#F0EFEC;border-radius:99px;height:9px;width:80%;margin-bottom:8px"></div>
          <div style="background:#F0EFEC;border-radius:99px;height:9px;width:55%;margin-bottom:14px"></div>
          <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:6px 10px">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:5px;vertical-align:middle">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round"/></svg>
              </td>
              <td style="font-size:9.5px;font-weight:700;color:#B91C1C;letter-spacing:.06em;font-family:-apple-system,BlinkMacSystemFont,sans-serif;vertical-align:middle">EXPIRED</td>
            </tr></table>
          </div>
        </div>
      </td>

      <!-- Arrow -->
      <td align="center" valign="middle" width="16%">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto">
          <path d="M7 18h22M21 10l8 8-8 8" stroke="#7C3AED" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </td>

      <!-- New password card -->
      <td align="center" valign="middle" width="42%">
        <div style="background:#fff;border-radius:16px;padding:20px 18px;display:inline-block;box-shadow:0 8px 28px rgba(124,58,237,.18);border:1.5px solid rgba(124,58,237,.2);text-align:left;width:130px">
          <div style="font-size:9px;font-weight:700;letter-spacing:.1em;color:#B4B2A9;margin-bottom:14px;font-family:-apple-system,BlinkMacSystemFont,sans-serif">NEW PASSWORD</div>
          <div style="background:#F0EFEC;border-radius:99px;height:9px;width:75%;margin-bottom:8px;overflow:hidden"><div style="background:#C084FC;height:9px;width:100%;border-radius:99px"></div></div>
          <div style="background:#F0EFEC;border-radius:99px;height:9px;width:50%;margin-bottom:8px;overflow:hidden"><div style="background:#A78BFA;height:9px;width:100%;border-radius:99px"></div></div>
          <div style="background:#F0EFEC;border-radius:99px;height:9px;width:90%;margin-bottom:8px;overflow:hidden"><div style="background:#C084FC;height:9px;width:100%;border-radius:99px"></div></div>
          <div style="background:#F0EFEC;border-radius:99px;height:9px;width:60%;margin-bottom:14px;overflow:hidden"><div style="background:#A78BFA;height:9px;width:100%;border-radius:99px"></div></div>
          <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:8px;padding:6px 10px">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:5px;vertical-align:middle">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5l3 3 5-5" stroke="#16A34A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </td>
              <td style="font-size:9.5px;font-weight:700;color:#15803D;letter-spacing:.06em;font-family:-apple-system,BlinkMacSystemFont,sans-serif;vertical-align:middle">SECURED</td>
            </tr></table>
          </div>
        </div>
      </td>
    </tr>
  </table>
</div>`;

export async function sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  if (!RESEND_API_KEY) {
    console.log(`[DEV] Verify email: ${verifyUrl}`);
    return;
  }

  const body = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#C084FC;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Helvetica,Arial,sans-serif">Welcome to Revilo</p>
    <h1 style="margin:0 0 14px;font-size:26px;font-weight:300;letter-spacing:-.025em;line-height:1.2;color:#1C1C1A">Verify your email address</h1>
    <p style="margin:0 0 26px;font-size:15px;color:#706F6A;line-height:1.75">You're one step away from connecting your Figma library and codebase. Confirm your email to activate your account — this link expires in <strong style="color:#1C1C1A;font-weight:500">24 hours</strong>.</p>
    ${PILL_BTN(verifyUrl, "Verify my email")}
    ${LINK_FALLBACK(verifyUrl)}`;

  const html = shell(WORDMARK("ve"), VERIFY_HERO, body, "If you didn't create a Revilo account, you can safely ignore this email.");

  const { Resend } = await import("resend");
  await new Resend(RESEND_API_KEY).emails.send({ from: FROM_EMAIL, to, subject: "Verify your Revilo account", html });
}

export async function sendPasswordResetEmail(to: string, token: string, baseUrl: string): Promise<void> {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  if (!RESEND_API_KEY) {
    console.log(`[DEV] Reset password: ${resetUrl}`);
    return;
  }

  const body = `
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#C084FC;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Helvetica,Arial,sans-serif">Account security</p>
    <h1 style="margin:0 0 14px;font-size:26px;font-weight:300;letter-spacing:-.025em;line-height:1.2;color:#1C1C1A">Reset your password</h1>
    <p style="margin:0 0 26px;font-size:15px;color:#706F6A;line-height:1.75">We received a request to reset your Revilo password. Click below to choose a new one — this link expires in <strong style="color:#1C1C1A;font-weight:500">1 hour</strong> and can only be used once.</p>
    ${PILL_BTN(resetUrl, "Reset my password")}
    ${LINK_FALLBACK(resetUrl)}`;

  const html = shell(WORDMARK("pr"), RESET_HERO, body, "If you didn't request a password reset, no action is needed. Your password will not change.");

  const { Resend } = await import("resend");
  await new Resend(RESEND_API_KEY).emails.send({ from: FROM_EMAIL, to, subject: "Reset your Revilo password", html });
}
