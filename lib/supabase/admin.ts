import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "@/constants/config";

/**
 * The service-role Supabase client — bypasses Row Level Security
 * entirely and can call `auth.admin.*` (inviting users, etc). This is
 * exactly the elevated access a platform admin operation legitimately
 * needs (creating a customer's account, viewing/editing ANY
 * organization's plan — not just "my own org", which is all the
 * customer-facing app's RLS policies were ever designed to allow).
 *
 * The `import "server-only"` line above is not a comment — it's a real
 * package that makes Next.js throw a BUILD ERROR if this module is ever
 * imported into a file that could end up in the client bundle. This
 * module is only ever imported from Server Actions (lib/actions/*.ts,
 * all marked `"use server"`) and this project's middleware/server
 * components — never from a "use client" component, and this guarantees
 * that structurally rather than relying on nobody making a mistake.
 */
export function createAdminClient() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. This admin panel cannot function without it — " +
        "see README.md for where to find it in your Supabase project settings.",
    );
  }

  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
