import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma generiert den Client an einem eigenen Ort (app/generated/prisma statt
  // node_modules) — Next.js' automatisches File-Tracing für Vercel-Functions
  // übersieht dabei sonst die Query-Engine-Binärdatei.
  outputFileTracingIncludes: {
    "/*": ["./app/generated/prisma/**/*"],
  },
};

export default nextConfig;
