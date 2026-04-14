import type { NextConfig } from "next";

// Server-side rewrites: browser calls same-origin `/api/*`; Next forwards to the Go API (`API_ORIGIN`).
const apiOrigin = process.env.API_ORIGIN ?? "http://127.0.0.1:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiOrigin}/api/auth/:path*`,
      },
      {
        source: "/api/bank-accounts",
        destination: `${apiOrigin}/api/bank-accounts`,
      },
      {
        source: "/api/bank-accounts/:path*",
        destination: `${apiOrigin}/api/bank-accounts/:path*`,
      },
    ];
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/9.x/**",
      },
    ],
  },
};

export default nextConfig;
