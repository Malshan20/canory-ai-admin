"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { replyToTicket } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setError(null);
    setIsSending(true);

    const result = await replyToTicket(ticketId, message.trim());
    setIsSending(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Type your reply — the customer will be emailed a link to view and respond."
        className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" disabled={isSending || !message.trim()}>
        {isSending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        Send reply
      </Button>
    </form>
  );
}
