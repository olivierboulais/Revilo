import { DriftResult } from "@/lib/drift/detect";

const FROM_EMAIL = process.env.FROM_EMAIL ?? "Revilo <noreply@revilo.app>";

export async function sendDriftAlert(to: string, workspaceName: string, drift: DriftResult, baseUrl: string): Promise<void> {
  const dropLines = drift.drops
    .map((d) => `<li><strong>${d.metric}</strong>: ${d.previous} → ${d.current} (−${d.delta} pts)</li>`)
    .join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
      <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Drift detected in ${workspaceName}</h2>
      <p style="color:#6B7280;font-size:14px;margin-bottom:20px">
        Your latest Revilo scan shows a significant score drop. Here's what changed:
      </p>
      <ul style="font-size:14px;color:#1C1C1A;margin-bottom:24px;padding-left:20px;line-height:1.8">
        ${dropLines}
      </ul>
      <a href="${baseUrl}/dashboard"
         style="display:inline-block;background:#1C1C1A;color:#fff;text-decoration:none;
                padding:12px 24px;border-radius:10px;font-size:14px;font-weight:500">
        View full report
      </a>
      <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
        You're receiving this because your workspace is on the Monthly Monitoring plan.
        <a href="${baseUrl}/dashboard/settings" style="color:#9CA3AF">Manage settings</a>
      </p>
    </div>
  `;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Drift alert for ${to}:`, drift.drops);
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⚠️ Design system drift detected in ${workspaceName}`,
    html,
  });
}
