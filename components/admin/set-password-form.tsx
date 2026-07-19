"use client";

import { useActionState } from "react";
import { Leaf, Loader2 } from "lucide-react";
import { setInvitedPassword, type SetPasswordResult } from "@/lib/actions/invite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { CUSTOMER_APP_LOGIN_URL } from "@/constants/config";

const initialState: SetPasswordResult = {};

export function SetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: SetPasswordResult, formData: FormData) => setInvitedPassword(formData),
    initialState,
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-forest/10">
            <Leaf className="size-5 text-forest" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-semibold text-ink">Welcome to CanoryAI</h1>
          <p className="mt-1 text-sm text-muted">Set a password to finish creating your account.</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6">
          {state.success ? (
            <div className="space-y-4 text-center">
              <Alert variant="success">Your password is set.</Alert>
              <a
                href={CUSTOMER_APP_LOGIN_URL}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-forest text-sm font-medium text-white hover:bg-forest-deep"
              >
                Go to CanoryAI login
              </a>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input id="password" name="password" type="password" minLength={8} required autoFocus />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
              </div>

              {state.error && <Alert variant="error">{state.error}</Alert>}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : "Set password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
