import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Папка сборки приложения
  distDir: './dist',
  basePath: '',

  images: {
    // Включаем встроенную оптимизацию и разрешаем домен Open Library
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        pathname: '/**',
      },
    ],
  },

  // ИСПРАВЛЕНО ДЛЯ NEXT.JS 16+: Настройка путей для дефолтного сборщика Turbopack
  turbopack: {
    resolveAlias: {
      '@/': './src/',
    },
  },

  // Настройка путей для Webpack (необходима для совместимости с Jest / Vitest)
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    return config;
  },
};

export default nextConfig;
