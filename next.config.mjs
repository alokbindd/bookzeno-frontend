/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "13.201.84.104",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bookzeno-s3.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig