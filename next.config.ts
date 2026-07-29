import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root — there is an unrelated lockfile further up the tree
  // that Next would otherwise infer as the root.
  outputFileTracingRoot: __dirname,
  images: {
    // Serve AVIF where supported, WebP otherwise; next/image generates the
    // srcset variants from the source files in public/assets.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1200, 1920, 2048],
    // For a pure static host with no image optimizer (plain S3, GitHub Pages),
    // set `unoptimized: true` here and add `output: "export"`.
  },
};

export default nextConfig;
