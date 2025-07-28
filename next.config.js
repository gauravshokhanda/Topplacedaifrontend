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
        : "https://a0b8d0f7737c.ngrok-free.app",
  },
};

module.exports = nextConfig;
