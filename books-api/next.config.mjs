import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from 'next-intl/plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: './dist',
  basePath: '',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'openlibrary.org',
        pathname: '/**',
      },
    ],
  },

  turbopack: {
    root: __dirname,
    resolveAlias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  experimental: {
    serverExternalPackages: ['next-intl'],
  },

  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    return config;
  },
};

export default withNextIntl(nextConfig);
