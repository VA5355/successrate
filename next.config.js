/** @type {import('next').NextConfig} */
const nextConfig = {

    async rewrites() {
    return [
      { source: "/api/:path*", destination: "https://successrate.netlify.app/:path*" },
    ]
  },
}

module.exports = nextConfig
