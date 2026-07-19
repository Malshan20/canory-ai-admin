import Link from "next/link";
import { Building2, LogOut, Shield, Headset } from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/config";

export function Header({ adminEmail }: { adminEmail: string }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-forest">
            <Shield className="size-3.5 text-white" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-ink">{APP_NAME}</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-body hover:text-ink">
            <Building2 className="size-3.5" aria-hidden="true" />
            Companies
          </Link>
          <Link href="/tickets" className="flex items-center gap-1.5 text-sm text-body hover:text-ink">
            <Headset className="size-3.5" aria-hidden="true" />
            Tickets
          </Link>
          <span className="text-xs text-muted">{adminEmail}</span>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="size-3.5" aria-hidden="true" />
              Sign out
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
