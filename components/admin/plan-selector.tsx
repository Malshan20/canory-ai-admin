"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateCompanyPlan } from "@/lib/actions/companies";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { PLAN_OPTIONS, type Plan } from "@/constants/config";

export function PlanSelector({ organizationId, currentPlan }: { organizationId: string; currentPlan: string }) {
  const [selected, setSelected] = useState<Plan>(currentPlan as Plan);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateCompanyPlan(organizationId, selected);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSavedAt(Date.now());
    });
  }

  const isDirty = selected !== currentPlan;
  // Selecting "demo" here immediately starts a real 7-day clock the
  // moment Save is clicked — every feature works at full strength until
  // then, and the account is hard-locked out afterward (enforced on
  // every request, not just checked at login — see the main backend's
  // app/core/auth.py). Worth being explicit about before the click, not
  // after — this isn't reversible by picking "demo" again later; that
  // would just restart a fresh 7 days.
  const isSelectingDemo = selected === "demo" && isDirty;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select value={selected} onChange={(e) => setSelected(e.target.value as Plan)} className="max-w-[160px]">
          {PLAN_OPTIONS.map((plan) => (
            <option key={plan} value={plan}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </option>
          ))}
        </Select>
        <Button size="sm" onClick={handleSave} disabled={!isDirty || isPending}>
          {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : "Save"}
        </Button>
        {savedAt && !isDirty && (
          <span className="flex items-center gap-1 text-xs text-forest">
            <Check className="size-3.5" aria-hidden="true" />
            Saved
          </span>
        )}
      </div>
      {isSelectingDemo && (
        <Alert variant="info">
          Starts a real 7-day countdown the moment you save — full features, 2 documents per
          shipment, 2 team members. Locked out automatically after 7 days.
        </Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
