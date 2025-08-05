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
        : "https://ebc3b0c55b1a.ngrok-free.app",
  },
};

module.exports = nextConfig;
