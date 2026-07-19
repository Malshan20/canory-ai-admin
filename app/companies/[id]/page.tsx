import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getCompanyDetail } from "@/lib/actions/companies";
import { Header } from "@/components/admin/header";
import { PlanSelector } from "@/components/admin/plan-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDemoCountdown } from "@/lib/utils";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin();
  const company = await getCompanyDetail(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <Header adminEmail={admin.email} />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/" className="mb-4 flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to companies
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-ink">{company.name}</h1>
          <p className="mt-0.5 text-sm text-muted">Created {formatDate(company.created_at)}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-muted">Current plan</p>
              <p className="mt-1">
                <Badge variant={company.plan as "growth" | "enterprise" | "custom" | "demo"}>{company.plan}</Badge>
              </p>
              {company.plan === "demo" && (
                <p className="mt-1.5 text-xs text-muted">{formatDemoCountdown(company.demo_expires_at)}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Users className="size-4 text-muted" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted">Members</p>
                <p className="text-lg font-semibold text-ink">{company.member_count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Package className="size-4 text-muted" aria-hidden="true" />
              <div>
                <p className="text-xs text-muted">Shipments processed</p>
                <p className="text-lg font-semibold text-ink">{company.shipment_count}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Manage subscription plan</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanSelector organizationId={company.id} currentPlan={company.plan} />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Team members</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {company.members.map((member) => (
                <li key={member.user_id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{member.email ?? member.user_id}</p>
                    <p className="text-xs text-muted">Joined {formatDate(member.joined_at)}</p>
                  </div>
                  <Badge>{member.role}</Badge>
                </li>
              ))}
              {company.members.length === 0 && (
                <li className="px-5 py-4 text-sm text-muted">No members found.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
