import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Headset } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getTicketDetail } from "@/lib/actions/tickets";
import { Header } from "@/components/admin/header";
import { TicketReplyForm } from "@/components/admin/ticket-reply-form";
import { TicketStatusSelector } from "@/components/admin/ticket-status-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  const ticket = await getTicketDetail(id);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <Header adminEmail={admin.email} />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/tickets" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to tickets
        </Link>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-muted">{ticket.ticket_number}</p>
            <h1 className="mt-0.5 text-xl font-semibold text-ink">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-muted">
              {ticket.name} &lt;{ticket.email}&gt;
              {ticket.company ? ` · ${ticket.company}` : ""}
            </p>
          </div>
          <TicketStatusSelector ticketId={ticket.id} currentStatus={ticket.status} />
        </div>

        <div className="space-y-4">
          {ticket.messages.map((message) => (
            <div key={message.id} className={cn("flex gap-3", message.sender_type === "admin" && "flex-row-reverse text-right")}>
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  message.sender_type === "admin" ? "bg-forest/10" : "bg-canvas",
                )}
              >
                {message.sender_type === "admin" ? (
                  <Headset className="size-4 text-forest" aria-hidden="true" />
                ) : (
                  <User className="size-4 text-muted" aria-hidden="true" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-xl border border-border bg-surface px-4 py-3",
                  message.sender_type === "admin" && "bg-forest/5",
                )}
              >
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="font-medium text-ink">{message.sender_name}</span>
                  <span>{formatDate(message.created_at)}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-body">{message.body}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Reply</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketReplyForm ticketId={ticket.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
