import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: false,
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // allow all domains
      },
      {
        protocol: 'http',
        hostname: '**', // if you also need http
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    // Extract base URL (e.g., http://localhost:3000) from the full API URL
    const backendBaseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendBaseUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
