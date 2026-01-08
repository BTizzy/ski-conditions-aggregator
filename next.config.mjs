/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Next.js devtools for enhanced debugging and MCP server integration
  devIndicators: {
    appIsrStatus: true,
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // Enable headers for better caching and debugging
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Debug-Enabled',
            value: 'true',
          },
          {
            key: 'X-MCP-Server-Enabled',
            value: 'true',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache static images
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 24 hours
          },
        ],
      },
      // Cache API responses for radar data (shorter cache)
      {
        source: '/api/radar/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300', // 5 minutes
          },
        ],
      },
      // Cache resort conditions (medium cache)
      {
        source: '/api/resorts/conditions',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800', // 30 minutes
          },
        ],
      },
    ];
  },

  // Enable logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Moved from experimental
  serverExternalPackages: [],
};

import withBundleAnalyzer from '@next/bundle-analyzer';

const analyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false, // Don't open browser automatically
  analyzerMode: 'static', // Generate static HTML files
  reportFilename: 'bundle-analyzer-report.html', // Custom filename
  generateStatsFile: true, // Generate stats file
  statsFilename: 'bundle-stats.json', // Stats filename
});

export default analyzerConfig(nextConfig);