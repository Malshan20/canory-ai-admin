"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { inviteCustomer, type InviteCustomerResult } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_OPTIONS } from "@/constants/config";

const initialState: InviteCustomerResult = {};

export function InviteCustomerForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: InviteCustomerResult, formData: FormData) => inviteCustomer(formData),
    initialState,
  );

  return (
    <div className="mx-auto max-w-lg">
      <Link href="/" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to companies
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add a customer</CardTitle>
          <p className="mt-1 text-xs text-muted">
            Creates their organization and sends a real invite email — they set their own password and log
            in to CanoryAI directly. No password is ever set or seen by an admin.
          </p>
        </CardHeader>
        <CardContent>
          {state.success ? (
            <Alert variant="success">
              Invite sent. The customer will receive an email to set their password and log in to CanoryAI.
            </Alert>
          ) : (
            <form action={formAction} className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company name</Label>
                <Input id="companyName" name="companyName" placeholder="Acme Coffee Imports" required />
              </div>
              <div>
                <Label htmlFor="email">Customer email</Label>
                <Input id="email" name="email" type="email" placeholder="contact@acmeimports.com" required />
              </div>
              <div>
                <Label htmlFor="plan">Plan</Label>
                <Select id="plan" name="plan" defaultValue="growth">
                  {PLAN_OPTIONS.map((plan) => (
                    <option key={plan} value={plan} className="capitalize">
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>

              {state.error && <Alert variant="error">{state.error}</Alert>}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    <Send className="size-4" aria-hidden="true" />
                    Send invite
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
