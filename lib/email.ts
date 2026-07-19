import "server-only";
import { RESEND_API_KEY, RESEND_FROM_ADDRESS } from "@/constants/config";

/**
 * Minimal Resend integration — mirrors the main CanoryAI app's
 * app/services/email_service.py (same reasoning: one small file per
 * external service, plain fetch, no SDK dependency). Duplicated here
 * rather than called across projects because this admin panel is
 * deliberately self-contained and independently deployable — see this
 * project's README for why it's a separate project at all.
 *
 * Same honest caveat as the main app's version: written against
 * Resend's documented REST API, not verified against a live account
 * from this sandbox.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set — ticket reply emails are disabled.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_ADDRESS,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
