"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { updateTicketStatus, type TicketStatus } from "@/lib/actions/tickets";
import { Select } from "@/components/ui/select";

const STATUS_OPTIONS: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
const STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function TicketStatusSelector({ ticketId, currentStatus }: { ticketId: string; currentStatus: TicketStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleChange(newStatus: TicketStatus) {
    setStatus(newStatus);
    setIsSaving(true);
    const result = await updateTicketStatus(ticketId, newStatus);
    setIsSaving(false);
    if (!result.error) setSavedAt(Date.now());
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onChange={(e) => handleChange(e.target.value as TicketStatus)} className="w-40">
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABEL[option]}
          </option>
        ))}
      </Select>
      {isSaving && <Loader2 className="size-3.5 animate-spin text-muted" aria-hidden="true" />}
      {savedAt && !isSaving && <Check className="size-3.5 text-forest" aria-hidden="true" />}
    </div>
  );
}
