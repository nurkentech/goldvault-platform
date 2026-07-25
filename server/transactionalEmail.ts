import { Resend } from "resend";

export type TransactionalEmailKind =
  | "deposit_confirmed"
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "kyc_approved"
  | "kyc_rejected"
  | "investment_matured"
  | "new_login";

export interface TransactionalEmailInput {
  to: string | null | undefined;
  kind: TransactionalEmailKind;
  amount?: string;
  currency?: string;
  reason?: string;
  payout?: string;
  device?: string;
  ipAddress?: string;
}

const subjects: Record<TransactionalEmailKind, string> = {
  deposit_confirmed: "Your deposit has been confirmed",
  withdrawal_approved: "Your withdrawal has been approved",
  withdrawal_rejected: "Your withdrawal was not approved",
  kyc_approved: "Your identity verification was approved",
  kyc_rejected: "Your identity verification needs attention",
  investment_matured: "Your investment has matured",
  new_login: "New sign-in to your GoldVaults account",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function messageFor(input: TransactionalEmailInput): string {
  const amount = escapeHtml(input.amount ?? "");
  const currency = escapeHtml(input.currency ?? "");
  const reason = escapeHtml(input.reason ?? "Please contact support for more information.");
  const payout = escapeHtml(input.payout ?? "");
  switch (input.kind) {
    case "deposit_confirmed":
      return `Your deposit of ${amount} ${currency} has been confirmed and credited to your wallet.`;
    case "withdrawal_approved":
      return `Your withdrawal of ${amount} ${currency} has been approved.`;
    case "withdrawal_rejected":
      return `Your withdrawal of ${amount} ${currency} was not approved. ${reason}`;
    case "kyc_approved":
      return "Your identity verification has been approved. You now have full platform access.";
    case "kyc_rejected":
      return `Your identity verification was not approved. ${reason}`;
    case "investment_matured":
      return `Your investment has matured and ${payout} ${currency} was credited to your wallet.`;
    case "new_login":
      return `A new sign-in was detected from ${escapeHtml(input.device ?? "an unknown device")} (${escapeHtml(input.ipAddress ?? "unknown IP")}). If this was not you, revoke the session immediately from Security Center.`;
  }
}

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
): Promise<{ success: boolean; error?: string }> {
  if (!input.to) return { success: false, error: "Recipient has no email address" };
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[Email] Skipping ${input.kind}: RESEND_API_KEY is not configured`);
    return { success: false, error: "Email delivery is not configured" };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "GoldVaults.us <noreply@goldvaults.us>",
      to: [input.to],
      subject: subjects[input.kind],
      html: `<div style="font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:32px"><div style="max-width:560px;margin:auto;background:#1e293b;border:1px solid #334155;border-radius:14px;padding:28px"><h1 style="color:#f59e0b;font-size:22px;margin:0 0 18px">GoldVaults</h1><p style="line-height:1.7;margin:0">${messageFor(input)}</p><p style="color:#94a3b8;font-size:12px;margin:24px 0 0">This is an automated transactional notification.</p></div></div>`,
    });
    if (error) {
      console.error(`[Email] Resend rejected ${input.kind}:`, error);
      return { success: false, error: "Email provider rejected the message" };
    }
    return { success: true };
  } catch (error) {
    console.error(`[Email] Failed to send ${input.kind}:`, error);
    return { success: false, error: "Email delivery failed" };
  }
}
