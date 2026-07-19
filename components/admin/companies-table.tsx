import Link from "next/link";
import { Users, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDemoCountdown } from "@/lib/utils";
import type { CompanySummary } from "@/lib/actions/companies";

export function CompaniesTable({ companies }: { companies: CompanySummary[] }) {
  if (companies.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted">No companies yet. Add your first customer to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-canvas text-left text-xs font-medium uppercase tracking-wide text-muted">
            <th className="px-5 py-3">Company</th>
            <th className="px-5 py-3">Plan</th>
            <th className="px-5 py-3">Members</th>
            <th className="px-5 py-3">Shipments</th>
            <th className="px-5 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {companies.map((company) => (
            <tr key={company.id} className="hover:bg-canvas/60">
              <td className="px-5 py-3">
                <Link href={`/companies/${company.id}`} className="font-medium text-ink hover:text-forest">
                  {company.name}
                </Link>
              </td>
              <td className="px-5 py-3">
                <Badge variant={company.plan as "growth" | "enterprise" | "custom" | "demo"}>{company.plan}</Badge>
                {company.plan === "demo" && (
                  <p className="mt-1 text-xs text-muted">{formatDemoCountdown(company.demo_expires_at)}</p>
                )}
              </td>
              <td className="px-5 py-3 text-body">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted" aria-hidden="true" />
                  {company.member_count}
                </span>
              </td>
              <td className="px-5 py-3 text-body">
                <span className="flex items-center gap-1.5">
                  <Package className="size-3.5 text-muted" aria-hidden="true" />
                  {company.shipment_count}
                </span>
              </td>
              <td className="px-5 py-3 text-muted">{formatDate(company.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
