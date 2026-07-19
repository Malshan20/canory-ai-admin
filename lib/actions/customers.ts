"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { APP_URL, type Plan } from "@/constants/config";

export interface InviteCustomerResult {
  error?: string;
  success?: boolean;
}

/**
 * The core flow this whole panel exists for: add a customer's email,
 * they get a real invite email to set their own password, and a new
 * organization is created with them as its owner.
 *
 * Two calls, in order, both against the same Supabase project the main
 * CanoryAI app already uses:
 *
 *   1. `auth.admin.inviteUserByEmail()` — creates the `auth.users` row
 *      AND sends Supabase's own built-in invite email, with no separate
 *      email service needed. The link in that email brings them to
 *      `app/invite/callback` in *this* project (see `APP_URL`), which
 *      establishes their session and hands them to a "set your
 *      password" form — after that, they use the main app to actually
 *      log in and work.
 *   2. `create_organization_with_owner()` — the exact same SECURITY
 *      DEFINER Postgres function the main app's self-serve signup flow
 *      calls (see that codebase's multi-tenancy migration). Reused
 *      here via Supabase's auto-generated RPC endpoint rather than
 *      reimplemented, so org-bootstrapping logic exists in exactly one
 *      place regardless of which of the two ways an org gets created.
 *
 * If step 2 fails after step 1 already succeeded, the invited user
 * exists but has no organization yet — logged clearly so it's visible
 * rather than silently inconsistent; the fix is to retry creating the
 * org for that same email (inviteUserByEmail is idempotent-ish for an
 * already-invited-but-unconfirmed user).
 */
export async function inviteCustomer(formData: FormData): Promise<InviteCustomerResult> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const plan = String(formData.get("plan") ?? "growth") as Plan;

  if (!email || !companyName) {
    return { error: "Both a company name and an email address are required." };
  }

  const admin = createAdminClient();

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${APP_URL}/invite/callback`,
  });

  if (inviteError || !inviteData.user) {
    return { error: `Could not send invite: ${inviteError?.message ?? "unknown error"}` };
  }

  const { data: orgId, error: orgError } = await admin.rpc("create_organization_with_owner", {
    org_name: companyName,
    owner_user_id: inviteData.user.id,
  });

  if (orgError || !orgId) {
    return {
      error:
        `The invite email was sent, but creating the organization failed: ${orgError?.message ?? "unknown error"}. ` +
        `The account exists — retry to finish setting up their organization.`,
    };
  }

  if (plan !== "growth") {
    await admin.from("organizations").update({ plan }).eq("id", orgId);
  }

  revalidatePath("/");
  return { success: true };
}
