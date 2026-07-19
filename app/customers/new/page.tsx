import { requireAdmin } from "@/lib/auth";
import { Header } from "@/components/admin/header";
import { InviteCustomerForm } from "@/components/admin/invite-customer-form";

export default async function NewCustomerPage() {
  const admin = await requireAdmin();

  return (
    <div className="min-h-dvh bg-canvas">
      <Header adminEmail={admin.email} />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <InviteCustomerForm />
      </main>
    </div>
  );
}
