import type { HTMLAttributes } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "info";
}

const ICONS = { error: AlertCircle, success: CheckCircle2, info: Info } as const;
const STYLES = {
  error: "border-danger/20 bg-danger-bg text-danger",
  success: "border-forest/20 bg-forest/5 text-forest-deep",
  info: "border-slate-300 bg-slate-50 text-slate-700",
} as const;

export function Alert({ variant = "error", className, children, ...props }: AlertProps) {
  const Icon = ICONS[variant];
  return (
    <div
      className={cn("flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm", STYLES[variant], className)}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
