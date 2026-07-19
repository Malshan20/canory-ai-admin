"use server";

import { createClient } from "@/lib/supabase/server";

export interface SetPasswordResult {
  error?: string;
  success?: boolean;
}

/**
 * The customer-facing half of the invite flow — called from
 * app/invite/set-password/page.tsx once they've followed the email link
 * and landed here with a real (but password-less) session established
 * by app/invite/callback/route.ts.
 */
export async function setInvitedPassword(formData: FormData): Promise<SetPasswordResult> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your invite link has expired. Ask your CanoryAI contact to resend it." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  // Sign out of the session established by the invite link — they
  // should log in fresh, from the actual product, with the password
  // they just set, not stay silently authenticated inside this
  // internal admin project.
  await supabase.auth.signOut();
  return { success: true };
}
