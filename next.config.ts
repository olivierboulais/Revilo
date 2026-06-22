import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer and its transitive deps (fontkit, png-js, etc.) use
  // Node.js built-ins that can't be bundled by webpack. Marking them as
  // external tells Next.js to require() them at runtime instead of bundling.
  serverExternalPackages: ["@react-pdf/renderer", "canvas"],
};

export default nextConfig;
