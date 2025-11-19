/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // 🚀 FIX: disable Turbopack so file uploads work
  },
};

module.exports = nextConfig;
