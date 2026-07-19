"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface LoginResult {
  error?: string;
}

/**
 * Admin login. Deliberately re-checks `platform_admins` membership right
 * here, in addition to `requireAdmin()` checking it again on every
 * protected page load — a non-admin who happens to have valid Supabase
 * credentials (e.g. a customer, or someone re-using an old account)
 * should never even see a moment of "logged in" before getting bounced;
 * failing fast here is a better experience than briefly redirecting.
 */
export async function login(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Incorrect email or password." };
  }

  const admin = createAdminClient();
  const { data: adminRow } = await admin
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!adminRow) {
    await supabase.auth.signOut();
    return { error: "This account is not authorized to access the admin panel." };
  }

  redirect("/");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
