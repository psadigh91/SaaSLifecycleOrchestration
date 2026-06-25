/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Optimize for serverless deployment
  output: 'standalone',

  // Environment variables that should be available to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'SaaS Lifecycle Orchestration',
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration for serverless optimization
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Reduce bundle size for serverless functions
      config.externals = [...(config.externals || []), 'pg-native'];
    }
    return config;
  },
};

module.exports = nextConfig;
