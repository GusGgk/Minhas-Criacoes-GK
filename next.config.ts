import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's on-disk cache (default on since 16.3) handed a stale
    // globals.css to a production build once and to `next dev` before that:
    // new markup, old rules, nothing visibly wrong in the logs. This site
    // builds in seconds, so the cache buys nothing worth that risk.
    turbopackFileSystemCacheForBuild: false,
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
