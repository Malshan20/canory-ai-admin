import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/constants/config";

/**
 * Refreshes the Supabase session cookie on every request and redirects
 * entirely unauthenticated visitors to /login. This is deliberately the
 * *cheap* check only (does a session exist at all) — middleware runs on
 * every request and shouldn't be doing a database round-trip. The real
 * "is this person actually a platform admin" check (querying
 * `platform_admins` with the service-role client) happens in
 * `lib/auth.ts`'s `requireAdmin()`, called at the top of every protected
 * page — that one needs the Node runtime the service-role client
 * requires, which middleware's edge runtime can't guarantee.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // IMPORTANT: do not run any logic between createServerClient and
  // getUser() — this call is what actually refreshes the session token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath =
    request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/invite");

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
