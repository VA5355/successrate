/** @type {import('next').NextConfig} */
const nextConfig = {
    // 🔒 Prevent watching outside project
  experimental: {
    externalDir: false,
  },

  webpack: (config) => {
    config.watchOptions = {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/hiberfil.sys',
        '**/pagefile.sys',
        '**/swapfile.sys',
      ],
    };
    return config;
  },
    async rewrites() {
    return [
      { source: "/api/:path*", destination: "https://successrate.netlify.app/:path*" },
    ]
  },
}

module.exports = nextConfig
