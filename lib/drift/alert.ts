import { DriftResult } from "@/lib/drift/detect";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "Revilo <noreply@revilo.design>";

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

export async function sendDriftAlert(
  to: string,
  workspaceName: string,
  drift: DriftResult,
  baseUrl: string,
): Promise<void> {
  const dropRows = drift.drops
    .map((d) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #F0EFEC;font-size:14px;color:#1C1C1A;font-weight:500">${d.metric}</td>
        <td style="padding:10px 0;border-bottom:1px solid #F0EFEC;font-size:14px;color:#6B7280;text-align:right">
          ${d.previous} → ${d.current}
          <span style="display:inline-block;margin-left:8px;background:#FEE2E2;color:#B91C1C;
                        font-size:11px;font-weight:600;padding:2px 7px;border-radius:99px">
            −${d.delta} pts
          </span>
        </td>
      </tr>`)
    .join("");

  const content = `
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;letter-spacing:.06em;color:#EF4444;text-transform:uppercase">Drift alert</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1C1C1A;line-height:1.3">
      Your design system drifted
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.7">
      Your latest Revilo scan for <strong style="color:#1C1C1A">${workspaceName}</strong> detected a significant score drop.
      Here's what changed since your last scan:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;font-weight:600;letter-spacing:.06em;color:#9CA3AF;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #F0EFEC">Metric</th>
          <th style="text-align:right;font-size:11px;font-weight:600;letter-spacing:.06em;color:#9CA3AF;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #F0EFEC">Change</th>
        </tr>
      </thead>
      <tbody>${dropRows}</tbody>
    </table>

    <a href="${baseUrl}/dashboard"
       style="display:inline-block;background:#1C1C1A;color:#F8F7F4;text-decoration:none;
              padding:13px 28px;border-radius:10px;font-size:14px;font-weight:500;
              letter-spacing:.01em">
      View full report →
    </a>
  `;

  const footer = `You're receiving this because <strong>${workspaceName}</strong> is on the Monthly Monitoring plan.
    &nbsp;·&nbsp;
    <a href="${baseUrl}/dashboard/settings" style="color:#9CA3AF">Manage settings</a>`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Drift alert for ${to}:`, drift.drops);
    return;
  }

  const { Resend } = await import("resend");
  await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Design system drift detected — ${workspaceName}`,
    html: emailShell(content, footer),
  });
}
