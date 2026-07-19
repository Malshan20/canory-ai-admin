import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/constants/config";

/**
 * Server-side Supabase client, scoped to the current request's session
 * cookies — anon key only. Used to answer "who is currently logged in,"
 * never for privileged operations (see lib/supabase/admin.ts for those).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component during render — middleware
          // already refreshes the session on every request, so this is
          // safe to swallow (matches the standard @supabase/ssr pattern).
        }
      },
    },
  });
}
