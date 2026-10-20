import type { NextConfig } from "next";
import { validOrigin } from "./src/lib/config";

const backend = validOrigin(
  process.env.CONTENT_API_URL || "http://127.0.0.1:8000",
  "CONTENT_API_URL",
);
const config: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
export default config;
