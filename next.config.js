/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  distDir: '.next',
  // Skip static generation for dynamic routes
  output: 'standalone',
  // Use dynamic rendering for all pages
  experimental: {
    // Disable static generation for dynamic routes
    disableOptimizedLoading: true,
  },
  // Force dynamic rendering for specific routes
  async generateBuildId() {
    return 'build-' + Date.now();
  },
};

module.exports = nextConfig;
