import { DriftResult } from "@/lib/drift/detect";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "Revilo <noreply@revilo.design>";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://revilo.design";

const WORDMARK = `
<svg width="88" height="27" viewBox="0 0 169 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="REVILO">
  <mask id="dam0" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="23" height="52"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H22.1756V51.696H0V0Z" fill="white"/></mask>
  <g mask="url(#dam0)"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.456 21.5995V8.85651C21.456 2.95251 18.816-.000488281 13.536-.000488281H0V51.6965H6.912V6.26351H11.448C13.512 6.26351 14.544 7.51251 14.544 10.0075V24.9125H11.448H9.819L11.602 33.1785 15.624 51.6965H22.176L17.352 30.1675C20.088 28.9685 21.456 26.1125 21.456 21.5995Z" fill="#1C1C1A"/></g>
  <mask id="dam1" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="34" y="0" width="18" height="52"><path fill-rule="evenodd" clip-rule="evenodd" d="M34.4141.000244141H51.5501V51.696H34.4141V.000244141Z" fill="white"/></mask>
  <g mask="url(#dam1)"><path fill-rule="evenodd" clip-rule="evenodd" d="M34.4141 51.6962H51.5501V45.4312H41.3261V28.2232H50.3981V21.9602H41.3261V6.26324H51.5501V.000244141H34.4141V51.6962Z" fill="#1C1C1A"/></g>
  <mask id="dam2" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="61" y="0" width="26" height="52"><path fill-rule="evenodd" clip-rule="evenodd" d="M61.1953 0H86.1073V51.6959H61.1953V0Z" fill="white"/></mask>
  <g mask="url(#dam2)"><path fill-rule="evenodd" clip-rule="evenodd" d="M73.6513 39.456L68.0353 0H61.1953L69.5473 51.696H77.7553L86.1073 0H79.2673L73.6513 39.456Z" fill="#1C1C1A"/></g>
  <mask id="dam3" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="169" height="52"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 51.696H168.262V0H0V51.696Z" fill="white"/></mask>
  <g mask="url(#dam3)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M97.2734 51.696H104.185V0H97.2734V51.696Z" fill="#1C1C1A"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M124.771 0H117.859V51.696H134.275V45.432H124.771V0Z" fill="#1C1C1A"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M161.348 42.412C161.348 44.422 160.438 45.432 158.608 45.432H155.078C153.018 45.432 151.989 44.422 151.989 42.412V9.292C151.989 7.272 152.998 6.262 155.008 6.262H158.248C160.308 6.262 161.348 7.272 161.348 9.292V42.412ZM159.978.002H153.358C147.838.002 145.078 2.952 145.078 8.851V42.912C145.078 48.771 147.858 51.691 153.428 51.691H159.909C165.478 51.691 168.258 48.771 168.258 42.912V8.851C168.258 2.952 165.498.002 159.978.002Z" fill="#1C1C1A"/>
  </g>
</svg>`;

const DRIFT_HERO = `
<div style="background:radial-gradient(ellipse 80% 70% at 10% 20%,#FFDEDE 0%,transparent 55%),radial-gradient(ellipse 60% 60% at 90% 80%,#FCA5A533 0%,transparent 50%),#FFE4E0;padding:44px 24px">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <!-- Design side -->
      <td align="center" valign="top" width="42%">
        <div style="font-size:9.5px;font-weight:700;letter-spacing:.1em;color:rgba(28,28,26,.4);text-align:center;margin-bottom:10px;font-family:-apple-system,BlinkMacSystemFont,sans-serif">DESIGN</div>
        <div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 4px 20px rgba(239,68,68,.1)">
          <div style="background:#EFD9FF;border-radius:8px;height:32px;margin-bottom:8px;text-align:center;line-height:32px">
            <span style="font-size:10.5px;font-weight:600;color:#7C3AED;font-family:-apple-system,BlinkMacSystemFont,sans-serif">Button</span>
          </div>
          <div style="background:#F3E8FF;border-radius:6px;height:10px;margin-bottom:6px"></div>
          <div style="background:#F3E8FF;border-radius:6px;height:10px;width:70%;margin-bottom:10px"></div>
          <table cellpadding="0" cellspacing="0" width="100%"><tr>
            <td width="48%" style="background:#7C3AED;border-radius:99px;height:14px"></td>
            <td width="4%"></td>
            <td width="48%" style="background:#C084FC;border-radius:99px;height:14px"></td>
          </tr></table>
        </div>
      </td>

      <!-- GAP column -->
      <td align="center" valign="middle" width="16%">
        <div style="display:inline-block;text-align:center">
          <div style="width:2px;height:40px;background:repeating-linear-gradient(to bottom,#EF4444 0,#EF4444 5px,transparent 5px,transparent 10px);margin:0 auto"></div>
          <div style="background:#EF4444;color:#fff;font-size:8.5px;font-weight:700;padding:4px 7px;border-radius:99px;white-space:nowrap;letter-spacing:.05em;margin:4px 0;font-family:-apple-system,BlinkMacSystemFont,sans-serif">GAP</div>
          <div style="width:2px;height:40px;background:repeating-linear-gradient(to bottom,#EF4444 0,#EF4444 5px,transparent 5px,transparent 10px);margin:0 auto"></div>
        </div>
      </td>

      <!-- Code side (drifted) -->
      <td align="center" valign="top" width="42%">
        <div style="font-size:9.5px;font-weight:700;letter-spacing:.1em;color:rgba(28,28,26,.4);text-align:center;margin-bottom:10px;font-family:-apple-system,BlinkMacSystemFont,sans-serif">CODE</div>
        <div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 4px 20px rgba(239,68,68,.1);border:1.5px dashed #FCA5A5">
          <div style="background:#FEE2E2;border-radius:8px;height:26px;margin-bottom:8px;margin-top:3px;text-align:center;line-height:26px">
            <span style="font-size:10.5px;font-weight:600;color:#B91C1C;font-family:-apple-system,BlinkMacSystemFont,sans-serif">btn</span>
          </div>
          <div style="background:#FEF2F2;border-radius:6px;height:10px;margin-bottom:6px;margin-left:10px"></div>
          <div style="background:#FEF2F2;border-radius:6px;height:10px;margin-left:20px;margin-bottom:10px"></div>
          <table cellpadding="0" cellspacing="0" width="100%"><tr>
            <td width="48%" style="background:#F87171;border-radius:4px;height:14px"></td>
            <td width="4%"></td>
            <td width="36%" style="background:#FCA5A5;border-radius:4px;height:14px"></td>
            <td width="12%"></td>
          </tr></table>
        </div>
      </td>
    </tr>
  </table>
</div>`;

export async function sendDriftAlert(
  to: string,
  workspaceName: string,
  drift: DriftResult,
  baseUrl: string,
): Promise<void> {
  const dropRows = drift.drops
    .map((d) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F0EFEC;font-size:14px;color:#1C1C1A;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Helvetica,Arial,sans-serif">${d.metric}</td>
        <td style="padding:10px 0;border-bottom:1px solid #F0EFEC;font-size:14px;color:#706F6A;text-align:right;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Helvetica,Arial,sans-serif">
          ${d.previous} → ${d.current}
          <span style="display:inline-block;margin-left:8px;background:#FEE2E2;color:#B91C1C;font-size:11px;font-weight:600;padding:2px 7px;border-radius:99px">−${d.delta} pts</span>
        </td>
      </tr>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>Revilo</title></head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F4;padding:36px 16px 52px">
  <tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

    <tr><td style="padding:0 4px 24px">${WORDMARK}</td></tr>

    <tr><td style="background:#ffffff;border-radius:20px;border:1px solid rgba(28,28,26,.1);overflow:hidden">
      <table width="100%" cellpadding="0" cellspacing="0">

        <!-- Hero graphic -->
        <tr><td>${DRIFT_HERO}</td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 36px 28px">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#EF4444">Drift alert</p>
          <h1 style="margin:0 0 14px;font-size:26px;font-weight:300;letter-spacing:-.025em;line-height:1.2;color:#1C1C1A">Your design system drifted</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#706F6A;line-height:1.75">
            Your latest scan for <strong style="color:#1C1C1A;font-weight:500">${workspaceName}</strong> shows a gap between what's in Figma and what's in your codebase. Here's what changed:
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <thead>
              <tr>
                <th style="text-align:left;font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#B4B2A9;padding-bottom:10px;border-bottom:1.5px solid rgba(28,28,26,.08)">Metric</th>
                <th style="text-align:right;font-size:10.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#B4B2A9;padding-bottom:10px;border-bottom:1.5px solid rgba(28,28,26,.08)">Change</th>
              </tr>
            </thead>
            <tbody>${dropRows}</tbody>
          </table>

          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#1C1C1A;border-radius:999px">
                <a href="${baseUrl}/dashboard" style="display:inline-block;padding:12px 24px;text-decoration:none;font-size:13.5px;font-weight:500;color:#ffffff;white-space:nowrap">
                  View full report
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F8F7F4;border-top:1px solid rgba(28,28,26,.08);padding:18px 36px;border-radius:0 0 20px 20px">
          <p style="margin:0;font-size:11.5px;color:#9CA3AF;line-height:1.6">
            You're receiving this because <strong style="color:#706F6A;font-weight:500">${workspaceName}</strong> is on the Monthly Monitoring plan.
            &nbsp;·&nbsp;
            <a href="${baseUrl}/dashboard/settings" style="color:#9CA3AF;text-decoration:underline">Manage settings</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
  </td></tr>
</table>
</body></html>`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Drift alert for ${to}:`, drift.drops);
    return;
  }

  const { Resend } = await import("resend");
  await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Design system drift detected — ${workspaceName}`,
    html,
  });
}
