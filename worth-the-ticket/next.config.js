/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static prerendering — all pages render at request time
  // This avoids Recharts and Supabase client errors during build
  output: undefined,
  images: {
    domains: [],
  },
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
