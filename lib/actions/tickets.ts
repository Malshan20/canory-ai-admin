"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { CUSTOMER_APP_TICKET_TRACKING_URL } from "@/constants/config";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface TicketSummary {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  company: string | null;
  subject: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface TicketMessage {
  id: string;
  sender_type: "customer" | "admin";
  sender_name: string;
  body: string;
  created_at: string;
}

export interface TicketDetail extends TicketSummary {
  messages: TicketMessage[];
}

/**
 * Lists every contact ticket, newest activity first — same "backend-
 * mediated public data, no per-tenant RLS" table the main app's
 * app/api/v1/contact.py writes to. This admin panel reads it directly
 * via the service-role client rather than calling the main app's API,
 * matching how every other admin-panel data access already works.
 */
export async function listTickets(): Promise<TicketSummary[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: tickets, error } = await admin
    .from("contact_tickets")
    .select("id, ticket_number, name, email, company, subject, status, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error || !tickets) {
    throw new Error(`Failed to load tickets: ${error?.message}`);
  }

  const results: TicketSummary[] = [];
  for (const ticket of tickets) {
    const { count } = await admin
      .from("contact_ticket_messages")
      .select("id", { count: "exact", head: true })
      .eq("ticket_id", ticket.id);
    results.push({ ...ticket, message_count: count ?? 0 });
  }
  return results;
}

export async function getTicketDetail(ticketId: string): Promise<TicketDetail | null> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: ticket } = await admin
    .from("contact_tickets")
    .select("id, ticket_number, name, email, company, subject, status, created_at, updated_at")
    .eq("id", ticketId)
    .maybeSingle();

  if (!ticket) return null;

  const { data: messages } = await admin
    .from("contact_ticket_messages")
    .select("id, sender_type, sender_name, body, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return { ...ticket, message_count: messages?.length ?? 0, messages: messages ?? [] };
}

/**
 * Staff reply — inserted as sender_type='admin', then emailed to the
 * customer (best-effort; the reply is saved either way, matching the
 * pattern everywhere else in this codebase where email is a courtesy
 * notification, never a gate on whether the underlying action succeeds).
 */
export async function replyToTicket(ticketId: string, message: string): Promise<{ error?: string }> {
  const adminUser = await requireAdmin();
  const admin = createAdminClient();

  const { data: ticket } = await admin
    .from("contact_tickets")
    .select("ticket_number, name, email, subject")
    .eq("id", ticketId)
    .maybeSingle();

  if (!ticket) {
    return { error: "Ticket not found." };
  }

  const { error: insertError } = await admin.from("contact_ticket_messages").insert({
    ticket_id: ticketId,
    sender_type: "admin",
    sender_name: "CanoryAI Support",
    body: message,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  await admin
    .from("contact_tickets")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  await sendEmail({
    to: ticket.email,
    subject: `Re: ${ticket.subject} — ${ticket.ticket_number}`,
    html:
      `<p>Hi ${ticket.name},</p>` +
      `<p>${message}</p>` +
      `<p style="margin-top:16px;"><a href="${CUSTOMER_APP_TICKET_TRACKING_URL}?ticket=${encodeURIComponent(ticket.ticket_number)}&email=${encodeURIComponent(ticket.email)}">View and reply to this ticket</a></p>`,
  });

  console.info(`Ticket ${ticket.ticket_number} replied to by ${adminUser.email}`);
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  return {};
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("contact_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) {
    return { error: error.message };
  }
  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  return {};
}
