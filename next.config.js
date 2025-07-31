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
        : "https://d312b60796ea.ngrok-free.app",
  },
};

module.exports = nextConfig;
