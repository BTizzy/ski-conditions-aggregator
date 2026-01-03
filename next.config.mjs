/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Next.js devtools for enhanced debugging and MCP server integration
  devIndicators: {
    appIsrStatus: true,
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // Enable headers for better debugging and tracing
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

export default nextConfig;