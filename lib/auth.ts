import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * The real authorization check for this entire app: not just "is there a
 * logged-in Supabase user" (middleware already handles that cheaply) but
 * "is this specific user a row in `platform_admins`". Call this at the
 * very top of every protected Server Component page — it redirects to
 * /login if either check fails, so a page using it can assume the
 * returned user is a genuine platform admin for the rest of its render.
 *
 * Deliberately does NOT trust any client-supplied claim of adminness —
 * it independently re-queries `platform_admins` via the service-role
 * client on every call, so revoking someone's admin access (deleting
 * their row) takes effect on their very next page load, not just their
 * next login.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: adminRow } = await admin
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    // A real Supabase session, but not a platform admin — sign them out
    // rather than leaving a half-authenticated, permanently-redirecting
    // session sitting in their browser.
    await supabase.auth.signOut();
    redirect("/login?error=not_authorized");
  }

  return { id: user.id, email: user.email };
}
