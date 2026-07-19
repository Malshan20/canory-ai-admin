/**
 * Environment-driven config. Never read `process.env.NEXT_PUBLIC_*` (or
 * server-only secrets) outside this file.
 */

export const APP_NAME = "CanoryAI Admin";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// SERVER-ONLY. Never prefixed with NEXT_PUBLIC_, never imported into any
// file that could end up in a client bundle — see lib/supabase/admin.ts,
// the one place this is allowed to be read.
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// This admin panel's own deployed URL — Supabase's invite email link
// points back here (app/invite/callback), not at the main CanoryAI app,
// since the "set your password" step is handled entirely within this
// separate project. Must be a full URL (Supabase requires it for the
// invite redirect), e.g. https://admin.canoryai.example.com.
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

// Where a customer is sent to actually log in and use the product, once
// they've finished setting their password here. The main CanoryAI app's
// login page — this is the only place that app's URL is referenced in
// this entire project, and only as a link, never a redirect target
// Supabase itself needs to know about.
export const CUSTOMER_APP_LOGIN_URL = process.env.NEXT_PUBLIC_CUSTOMER_APP_LOGIN_URL ?? "http://localhost:3000/login";

export const PLAN_OPTIONS = ["growth", "enterprise", "custom", "demo"] as const;
export type Plan = (typeof PLAN_OPTIONS)[number];

// For emailing a customer when staff reply to their contact ticket (see
// lib/actions/tickets.ts). Same Resend account as the main app —
// they're the same product's outbound email, just triggered from two
// different codebases. Optional: reply still saves without it, the
// customer just won't get an email nudge and needs to check
// /contact/track themselves.
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
export const RESEND_FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS ?? "CanoryAI <notifications@canoryai.example.com>";

// Where a customer goes to view/reply to their ticket — the main app's
// public tracking page, not this admin panel.
export const CUSTOMER_APP_TICKET_TRACKING_URL =
  process.env.NEXT_PUBLIC_CUSTOMER_APP_TICKET_TRACKING_URL ?? "http://localhost:3000/contact/track";
