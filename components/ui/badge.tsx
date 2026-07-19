import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "growth" | "enterprise" | "custom" | "demo" | "role";
}

const VARIANTS: Record<NonNullable<BadgeProps["variant"]>, string> = {
  growth: "bg-slate-100 text-slate-700",
  enterprise: "bg-forest/10 text-forest-deep",
  custom: "bg-amber-100 text-amber-800",
  // Deliberately distinct (not reusing amber/custom's color) — a demo
  // is time-limited in a way none of the real plans are, worth being
  // visually unmistakable at a glance in a list of companies.
  demo: "bg-purple-100 text-purple-700",
  role: "bg-canvas text-body border border-border",
};

export function Badge({ variant = "role", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
