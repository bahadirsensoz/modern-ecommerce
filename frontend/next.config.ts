import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dnzzsid5p/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.samsung.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lsco.scene7.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.patagonia.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.weimgs.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.laroche-posay.us',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.lego.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig;
