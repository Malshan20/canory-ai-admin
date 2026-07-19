"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { APP_URL } from "@/constants/config";

/**
 * Where Supabase's invite email link points.
 *
 * THIS MUST BE A CLIENT COMPONENT, NOT A SERVER ROUTE HANDLER — that
 * was the actual bug in the previous version of this file. Admin-
 * generated invite links (`auth.admin.inviteUserByEmail()`) don't carry
 * a PKCE `?code=` query parameter the way a browser-initiated OAuth flow
 * would; there's no "initiating client" holding a code_verifier, since
 * the invite was generated server-side by an admin action, not started
 * by the invitee's own browser. Instead, Supabase puts the session
 * directly in the URL as a `#access_token=...&refresh_token=...`
 * fragment.
 *
 * Fragments are never sent to a server — the browser strips everything
 * after `#` before the HTTP request is even made, so a server-side
 * Route Handler structurally cannot see it, no matter how it's written.
 * Only client-side JavaScript, reading `window.location.hash` after the
 * page has actually loaded in the browser, can process this — which is
 * the entire reason this had to change from a `route.ts` to a
 * `page.tsx`.
 */
export default function InviteCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeSignIn() {
      const supabase = createClient();

      // Fragment-based tokens (the actual path admin-generated invites
      // take) — window.location.hash is only ever available client-side.
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        window.location.href = `${APP_URL}/invite/set-password`;
        return;
      }

      // Fallback: PKCE `?code=` — kept in case Supabase's behavior for
      // this flow ever changes, so this page doesn't silently break if
      // it does.
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        window.location.href = `${APP_URL}/invite/set-password`;
        return;
      }

      setError("This invite link is missing its authentication token. Ask CanoryAI to resend the invite.");
    }

    completeSignIn();
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        {error ? (
          <>
            <AlertCircle className="size-6 text-danger" aria-hidden="true" />
            <p className="max-w-sm text-sm text-danger">{error}</p>
          </>
        ) : (
          <>
            <Loader2 className="size-6 animate-spin text-forest" aria-hidden="true" />
            <p className="text-sm text-muted">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
}
