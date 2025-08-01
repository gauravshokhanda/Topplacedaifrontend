/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.pexels.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === "production"
        ? "YOUR_PRODUCTION_API_URL"
        : "https://d312b60796ea.ngrok-free.app",
  },
};

module.exports = nextConfig;
