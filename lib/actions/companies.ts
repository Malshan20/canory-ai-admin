"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/constants/config";

export interface CompanySummary {
  id: string;
  name: string;
  plan: string;
  created_at: string;
  member_count: number;
  shipment_count: number;
  // Only ever non-null when plan === "demo" — see updateCompanyPlan's
  // docstring for exactly when this gets set and cleared. Mirrors
  // organizations.demo_expires_at in the main backend's schema exactly
  // (see backend/app/models/organization.py) — this admin panel writes
  // to the same table directly via the service-role client, so the two
  // must stay in sync by hand; there's no shared code between the two
  // separate projects to enforce that automatically.
  demo_expires_at: string | null;
}

export interface CompanyMember {
  user_id: string;
  email: string | null;
  role: string;
  joined_at: string;
}

export interface CompanyDetail extends CompanySummary {
  members: CompanyMember[];
}

/**
 * Lists every organization on the platform — the one query nothing in
 * the main customer-facing app can ever do, since every one of its RLS
 * policies is scoped to "the caller's own organization" by design. This
 * is exactly the capability a platform admin legitimately needs and a
 * customer never should, which is the whole reason this is a separate
 * project with its own separately-gated login rather than a "make me an
 * admin" flag bolted onto the existing app.
 *
 * Deliberately simple N+1-shaped queries below (one round-trip per org
 * for counts, one per member for email lookup) rather than a hand-tuned
 * join — this is an internal tool used by a handful of staff looking at
 * dozens-to-low-hundreds of organizations, not a customer-facing
 * high-traffic path; clarity wins over the query-count optimization here.
 */
export async function listCompanies(): Promise<CompanySummary[]> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: organizations, error } = await admin
    .from("organizations")
    .select("id, name, plan, created_at, demo_expires_at")
    .order("created_at", { ascending: false });

  if (error || !organizations) {
    throw new Error(`Failed to load organizations: ${error?.message}`);
  }

  const results: CompanySummary[] = [];
  for (const org of organizations) {
    const [{ count: memberCount }, { count: shipmentCount }] = await Promise.all([
      admin.from("user_roles").select("id", { count: "exact", head: true }).eq("organization_id", org.id),
      admin.from("shipments").select("id", { count: "exact", head: true }).eq("organization_id", org.id),
    ]);

    results.push({
      ...org,
      member_count: memberCount ?? 0,
      shipment_count: shipmentCount ?? 0,
    });
  }

  return results;
}

export async function getCompanyDetail(organizationId: string): Promise<CompanyDetail | null> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: org } = await admin
    .from("organizations")
    .select("id, name, plan, created_at, demo_expires_at")
    .eq("id", organizationId)
    .maybeSingle();

  if (!org) return null;

  const [{ data: memberRows }, { count: shipmentCount }] = await Promise.all([
    admin.from("user_roles").select("user_id, role, created_at").eq("organization_id", organizationId),
    admin.from("shipments").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
  ]);

  const members: CompanyMember[] = [];
  for (const row of memberRows ?? []) {
    const { data: userData } = await admin.auth.admin.getUserById(row.user_id);
    members.push({
      user_id: row.user_id,
      email: userData.user?.email ?? null,
      role: row.role,
      joined_at: row.created_at,
    });
  }

  return {
    ...org,
    member_count: members.length,
    shipment_count: shipmentCount ?? 0,
    members,
  };
}

/**
 * Changes an organization's plan — including the one thing that's easy
 * to get wrong here: switching TO "demo" must also start a real 7-day
 * clock (`demo_expires_at`), and switching AWAY from demo must clear it
 * back to null. This admin panel writes directly to Supabase via the
 * service-role client rather than going through the main backend's API,
 * so there's no shared code enforcing this — it has to be done by hand,
 * exactly matching backend/app/api/v1/organizations.py's
 * update_organization_plan (same CASE-style logic, just expressed in
 * JS instead of a single SQL UPDATE). Getting this wrong is silent and
 * serious: a company assigned the demo plan without demo_expires_at
 * ever being set would never actually lock out — the backend's own
 * expiry check treats a null demo_expires_at as "not configured yet"
 * and does nothing, not "expired immediately."
 */
export async function updateCompanyPlan(organizationId: string, plan: Plan): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const demoExpiresAt =
    plan === "demo" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null;

  const { error } = await admin
    .from("organizations")
    .update({ plan, demo_expires_at: demoExpiresAt })
    .eq("id", organizationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/companies/${organizationId}`);
  return {};
}
