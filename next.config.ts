import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Internal tool, never meant to be publicly indexed — belt-and-braces
  // on top of the /robots-equivalent noindex meta tag in app/layout.tsx.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
