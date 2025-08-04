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
        : "https://a67ae9e25cd7.ngrok-free.app",
  },
};

module.exports = nextConfig;
