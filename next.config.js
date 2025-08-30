// Memory optimization for low-resource hosting
// Memory optimization for low-resource hosting
/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  
  // Reduce memory usage during build and runtime
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
  },
  
  // Optimize images to reduce memory usage
  images: {
    // Reduce image optimization memory
    minimumCacheTTL: 60,
    // Allow Firebase Storage domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fcmkzwcemtlnudsmtkdt.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Reduce memory usage during build
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Reduce memory usage in production builds
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Create smaller chunks
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Reduce memory usage during development
  onDemandEntries: {
    // Reduce memory usage for page entries
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Compress static assets to reduce memory
  compress: true,
  
  // Reduce memory usage for static generation
  generateEtags: false,
  
  // Optimize for low-memory environments
  poweredByHeader: false,
};

module.exports = nextConfig;
