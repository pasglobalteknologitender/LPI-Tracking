import path from 'path';
import { fileURLToPath } from 'url';

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ['@lpi/contracts'],
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: monorepoRoot,
  },
  async rewrites() {
    const apiOrigin = process.env.API_URL ?? 'http://127.0.0.1:3001';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
