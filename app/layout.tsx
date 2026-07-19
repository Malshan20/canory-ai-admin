import type { Metadata } from "next";
import { APP_NAME } from "@/constants/config";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Internal admin panel for managing CanoryAI customer organizations.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
