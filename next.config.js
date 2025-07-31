/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  optimizeFonts: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === "production"
        ? "YOUR_PRODUCTION_API_URL"
        : "http://localhost:3002",
  },
};

module.exports = nextConfig;
