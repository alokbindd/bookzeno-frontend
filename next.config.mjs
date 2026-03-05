/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '13.201.84.104',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '13.201.84.104',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
