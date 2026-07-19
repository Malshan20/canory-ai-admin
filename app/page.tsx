import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listCompanies } from "@/lib/actions/companies";
import { Header } from "@/components/admin/header";
import { CompaniesTable } from "@/components/admin/companies-table";

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const companies = await listCompanies();

  return (
    <div className="min-h-dvh bg-canvas">
      <Header adminEmail={admin.email} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink">Companies</h1>
            <p className="mt-0.5 text-sm text-muted">
              {companies.length} {companies.length === 1 ? "organization" : "organizations"} on CanoryAI
            </p>
          </div>
          <Link
            href="/customers/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-forest px-4 text-sm font-medium text-white transition-colors hover:bg-forest-deep"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add customer
          </Link>
        </div>

        <CompaniesTable companies={companies} />
      </main>
    </div>
  );
}
