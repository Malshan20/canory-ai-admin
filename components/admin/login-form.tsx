"use client";

import { useActionState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { login, type LoginResult } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { APP_NAME } from "@/constants/config";

const initialState: LoginResult = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: LoginResult, formData: FormData) => login(formData),
    initialState,
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-forest/10">
            <Shield className="size-5 text-forest" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-semibold text-ink">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted">Staff access only.</p>
        </div>

        <form action={formAction} className="space-y-4 rounded-lg border border-border bg-surface p-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>

          {state.error && <Alert variant="error">{state.error}</Alert>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
