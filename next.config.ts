import type { NextConfig } from "next";

/**
 * The Supabase Storage host, taken from SUPABASE_URL so the allowlist follows
 * the project rather than being hardcoded. next/image refuses any remote URL
 * that is not matched here, so getting this wrong shows as a broken image with
 * a "url parameter is not allowed" response from the optimizer.
 */
const supabaseHost = (() => {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root — there is an unrelated lockfile further up the tree
  // that Next would otherwise infer as the root.
  outputFileTracingRoot: __dirname,
  images: {
    // Product photography uploaded through the dashboard is served from the
    // Supabase Storage public bucket; everything else still comes from public/.
    //
    // Deliberately narrow: one host, and only the public-object path within it.
    // That narrowness is what makes dangerouslyAllowLocalIP below acceptable.
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: supabaseHost ?? "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
        search: "",
      },
    ],
    // Next 16 resolves each upstream image host and refuses addresses it judges
    // private, as an SSRF guard. On a network using DNS64/NAT64 — common on
    // IPv6-only and many mobile networks — public hosts resolve through the
    // well-known 64:ff9b::/96 prefix, which that check misreads as private.
    // Supabase images then fail with a misleading "url parameter is not
    // allowed" 400, while the very same URL opens fine in a browser.
    //
    // Disabling the guard is safe HERE only because remotePatterns above pins
    // the optimizer to a single host and path prefix we control, so there is no
    // attacker-supplied destination to point it at. Widening remotePatterns
    // without revisiting this line would reintroduce real SSRF risk.
    dangerouslyAllowLocalIP: true,

    // Serve AVIF where supported, WebP otherwise; next/image generates the
    // srcset variants from the source files in public/assets.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 828, 1080, 1200, 1920, 2048],
    // For a pure static host with no image optimizer (plain S3, GitHub Pages),
    // set `unoptimized: true` here and add `output: "export"`.
  },
};

export default nextConfig;
