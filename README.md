# CanoryAI Admin Panel

A completely separate Next.js 16 project from the main CanoryAI app —
different codebase, different deployment, same Supabase project. Lets
CanoryAI staff add new customers (which sends them a real invite email
to set their own password) and manage any organization's subscription
plan.

## Why this needed to be a separate project, not a feature flag on the main app

The main CanoryAI app's entire permission model (`user_roles`, RLS
policies) is scoped to "you can see and manage your own organization" —
by design, nothing in it can see across every customer at once, and
nothing about it should be *able* to. A platform admin's job is
structurally different (see every organization, create new ones,
invite users directly via Supabase's admin API) and needs its own
completely separate login, gated by its own table
(`platform_admins`) that the main app's codebase and RLS policies
never reference at all.

## What it actually does

1. **Admin login** — gated by membership in a `platform_admins` table
   (see setup below), not by any role inside a customer's organization.
2. **Add a customer** — enter a company name and the customer's email.
   This calls Supabase's `auth.admin.inviteUserByEmail()`, which creates
   their account and sends a real invite email via Supabase's own
   built-in email service — no separate email provider needed. The
   customer clicks the link, lands on `/invite/set-password` (in this
   project), sets their own password, then logs into the **main
   CanoryAI app** from there on. No admin ever sees or sets a customer's
   password.
3. **Manage any company's plan** — Growth / Enterprise / Custom, the
   same three tiers the main app enforces shipment quotas and job
   priority against.
4. **Support tickets** — view every contact-form submission from the
   marketing site's `/contact` page, reply to them (the customer gets
   emailed, if `RESEND_API_KEY` is configured), and update ticket
   status. Reads/writes the same `contact_tickets` /
   `contact_ticket_messages` tables the main app's public API writes
   to — see that project's `app/api/v1/contact.py` for the customer-
   facing half of this system.

## One-time Supabase setup

Run this once in the Supabase SQL Editor, on the **same project** the
main CanoryAI app uses:

> The `contact_tickets` / `contact_ticket_messages` tables the ticket
> feature above needs aren't part of this section — they're created by
> the main app's own database migrations (or
> `canoryai_supabase_schema_update_6.sql`, if you're applying schema
> changes by hand rather than running Alembic). Nothing extra to run
> here specifically for this admin panel.

```sql
CREATE TABLE IF NOT EXISTS platform_admins (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email       VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_platform_admins_user_id UNIQUE (user_id)
);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins FORCE ROW LEVEL SECURITY;
-- Deliberately no policies at all: this table is only ever touched by
-- this admin panel's server-side code using the service role key,
-- which bypasses RLS entirely. No policy means zero access for any
-- lesser-privileged role — including the main app's own backend role —
-- which is exactly right: the customer-facing app has no reason to
-- know who CanoryAI's own staff are.
```

### Creating your first admin (there's no self-serve signup, on purpose)

1. Supabase Dashboard -> **Authentication** -> **Users** -> **Add user**
   -> create yourself an account with an email and a password directly
2. Copy that user's ID (shown in the Users list)
3. Run in the SQL Editor:
   ```sql
   INSERT INTO platform_admins (user_id, email)
   VALUES ('paste-the-user-id-here', 'you@canoryai.example.com');
   ```
4. You can now log in at `/login` with that email/password

To add more admins later, either repeat this manually, or (once you have
at least one admin) extend this panel with an "invite another admin"
flow — deliberately not built by default, since who can become an admin
is exactly the kind of thing that should require a manual, deliberate
step rather than a convenient button.

## Environment variables

See `.env.local.example`. The one that matters most:
`SUPABASE_SERVICE_ROLE_KEY` — treat it like a root password. It's what
lets this panel bypass RLS and invite users directly; if it ever leaks,
rotate it immediately from Supabase's dashboard.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in real values
npm run dev
```

Runs on `http://localhost:3001` by default if you also run the main app
locally on `3000` — set `-- -p 3001` or a `PORT` env var if `3001` is
taken.

## Deployment

Deploy exactly like the main app (Vercel, or any Next.js host) — but as
a **separate project**, with its own domain (e.g.
`admin.canoryai.example.com`) and, critically, `SUPABASE_SERVICE_ROLE_KEY`
set only here, never on the main customer-facing app's deployment.

## What this does not do (by design, not by oversight)

- **No self-serve admin signup** — see above; this is deliberate.
- **No audit log of admin actions** — the main app has a genuinely
  immutable, database-enforced audit vault for customer-facing
  compliance events; this panel doesn't yet have an equivalent for its
  own actions (who invited which customer, who changed which plan). A
  real production rollout should add one before this sees heavy use —
  same shape as the main app's `audit_log` table would work, scoped by
  `admin_user_id` instead of `organization_id`.
- **No email customization** — invite emails use Supabase's default
  template. Customize the wording in Supabase Dashboard ->
  Authentication -> Email Templates -> "Invite user", not in this
  codebase.
