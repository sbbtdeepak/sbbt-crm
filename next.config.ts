import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  // Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // XSS Protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Remove Server header
          {
            key: "Server",
            value: "SBBT",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';",
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()",
          },
        ],
      },
    ];
  },

  // Image Optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "btcvowucckvlqpcjaatj.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for immutable images
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },

  // Compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
};

export default nextConfig;
