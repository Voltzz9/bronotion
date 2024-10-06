/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'localhost', // Added localhost
        port: '8080', // Specify the port if using a non-standard port
      },
    ],
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
