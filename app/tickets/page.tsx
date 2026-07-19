import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listTickets } from "@/lib/actions/tickets";
import { Header } from "@/components/admin/header";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

const STATUS_VARIANT: Record<string, "growth" | "enterprise" | "custom" | "role"> = {
  open: "enterprise",
  in_progress: "custom",
  resolved: "role",
  closed: "role",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function TicketsPage() {
  const admin = await requireAdmin();
  const tickets = await listTickets();
  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  return (
    <div className="min-h-dvh bg-canvas">
      <Header adminEmail={admin.email} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink">Support tickets</h1>
          <p className="mt-0.5 text-sm text-muted">
            {tickets.length} total &middot; {openCount} needing a reply
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted">No contact form submissions yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Ticket</th>
                  <th className="px-5 py-3">From</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-canvas/60">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-medium text-muted">{ticket.ticket_number}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{ticket.name}</p>
                      <p className="text-xs text-muted">
                        {ticket.email}
                        {ticket.company ? ` · ${ticket.company}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-body">{ticket.subject}</td>
                    <td className="px-5 py-4">
                      <Badge variant={STATUS_VARIANT[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>
                    </td>
                    <td className="px-5 py-4 text-muted">{formatDate(ticket.updated_at)}</td>
                    <td className="px-5 py-4 text-right">
                      {/*
                        This is the actual fix — an explicit, unmissable
                        button. The row's ticket number and subject were
                        already links to this same page, which is exactly
                        the problem: a link that doesn't look like a
                        link isn't a real affordance. This button is the
                        one obvious way in, styled to look clickable
                        because it needs to be found at a glance, not
                        discovered by hovering over plain text.
                      */}
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-forest px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-forest-deep"
                      >
                        <MessageSquare className="size-3.5" aria-hidden="true" />
                        Reply
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
