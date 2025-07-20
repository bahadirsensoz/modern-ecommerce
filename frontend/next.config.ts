import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dnzzsid5p/**',
      },
    ],
  },
}

export default nextConfig;
