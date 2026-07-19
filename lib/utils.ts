import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * "3 days left" / "Expires today" / "Expired 2 days ago" for a demo
 * company's `demo_expires_at`. Returns null for anything that isn't a
 * real, parseable timestamp — callers should treat that as "don't show
 * a countdown," not as an error.
 */
export function formatDemoCountdown(demoExpiresAt: string | null): string | null {
  if (!demoExpiresAt) return null;
  const expires = new Date(demoExpiresAt);
  if (Number.isNaN(expires.getTime())) return null;

  const msRemaining = expires.getTime() - Date.now();
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));

  if (daysRemaining > 1) return `${daysRemaining} days left`;
  if (daysRemaining === 1) return "1 day left";
  if (daysRemaining === 0) return "Expires today";
  const daysAgo = Math.abs(daysRemaining);
  return `Expired ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
}
