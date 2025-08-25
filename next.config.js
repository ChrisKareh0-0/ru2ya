/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  images: {
    domains: [
      'fcmkzwcemtlnudsmtkdt.supabase.co',
      'firebasestorage.googleapis.com',
      'storage.googleapis.com'
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
