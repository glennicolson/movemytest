/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  // Ensure distDir is set for Hostinger
  distDir: '.next',
  // Ensure trailing slashes for compatibility
  trailingSlash: false,
};

module.exports = nextConfig;
